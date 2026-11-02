import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "@infra/database/prisma.service";
import { Prisma, DocumentActionType, GeneratedDocumentStatus } from "@prisma/client";
import { DocumentFilterDto, GenerateDocumentDto, VoidDocumentDto } from "../dto";
import { DocumentStorageService } from "./document-storage.service";
import { DocumentGeneratorService } from "./document-generator.service";

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: DocumentStorageService,
    private readonly generator: DocumentGeneratorService,
  ) {}

  // ==========================================================================
  // GENERACIÓN
  // ==========================================================================

  /**
   * Genera un documento a partir de una plantilla activa, con datos reales del
   * sistema. Conserva una copia emitida + metadatos y deja auditoría completa.
   * Los documentos históricos nunca se modifican cuando cambian plantillas/datos.
   */
  async generate(dto: GenerateDocumentDto, user: any) {
    const organizationId = user.organizationId;

    const template = await this.prisma.documentTemplate.findFirst({
      where: {
        id: dto.templateId,
        organizationId,
        status: "ACTIVE",
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
      },
    });

    if (!template) {
      throw new NotFoundException("Plantilla no encontrada, inactiva o fuera de vigencia");
    }

    // ── Datos reales del sistema para los campos dinámicos ──
    const [organization, employee, vacation, branch] = await Promise.all([
      this.prisma.organization.findUnique({ where: { id: organizationId } }),
      dto.employeeId
        ? this.prisma.nurse.findFirst({
            where: { id: dto.employeeId, organizationId },
            include: { user: true, department: true },
          })
        : Promise.resolve(null),
      dto.vacationId
        ? this.prisma.vacation.findFirst({
            where: { id: dto.vacationId, organizationId },
            include: { nurse: { include: { user: true } }, department: true },
          })
        : Promise.resolve(null),
      dto.branchId
        ? this.prisma.branch.findFirst({ where: { id: dto.branchId, organizationId } })
        : Promise.resolve(null),
    ]);

    if (dto.employeeId && !employee) {
      throw new NotFoundException("Empleado no encontrado");
    }
    if (dto.vacationId && !vacation) {
      throw new NotFoundException("Solicitud de vacaciones no encontrada");
    }

    // ── Numeración correlativa (atómica por plantilla) ──
    const { documentNumber } = await this.assignDocumentNumber(template.id);

    // ── Congelar valores y renderizar ──
    const values: Record<string, any> = {
      organization: { name: organization?.name, code: organization?.code, country: organization?.country },
      branch: branch ? { name: branch.name, address: branch.address, city: branch.city } : null,
      employee: employee
        ? {
            firstName: employee.user?.firstName,
            lastName: employee.user?.lastName,
            fullName: `${employee.user?.firstName ?? ""} ${employee.user?.lastName ?? ""}`.trim(),
            department: employee.department?.name,
            hireDate: employee.hire_date,
            contractType: employee.contract_type,
          }
        : null,
      vacation: vacation
        ? {
            startDate: vacation.startDate,
            endDate: vacation.endDate,
            status: vacation.status,
            reason: vacation.reason,
            requestedDays: vacation.requestedDays ? Number(vacation.requestedDays) : null,
            chargedDays: vacation.chargedDays ? Number(vacation.chargedDays) : null,
            approvedAt: vacation.approvedAt,
          }
        : null,
      document: { number: documentNumber, date: new Date(), generatedBy: user.name ?? user.email },
      today: new Date(),
      ...(dto.values ?? {}),
    };

    const renderedBody = this.generator.renderTemplate(template.body, values);
    const renderedTitle = dto.title ?? this.generator.renderTemplate(template.name, values);

    const pdfBuffer = await this.generator.renderPdf({
      title: renderedTitle,
      header: (template.header as Record<string, any>) ?? null,
      body: renderedBody,
      footer: (template.footer as Record<string, any>) ?? null,
      signatureBlocks: (template.signatureBlocks as any[]) ?? null,
      documentNumber,
      generatedAt: new Date(),
    });

    // ── Almacenar copia fiel ──
    const stored = await this.storage.save(organizationId, template.format === "DOCX" ? "pdf" : "pdf", pdfBuffer);

    // ── Registrar documento + auditoría (transacción) ──
    const metadata = {
      values,
      templateCode: template.code,
      templateName: template.name,
    };

    const retentionUntil = template.retentionDays
      ? new Date(Date.now() + template.retentionDays * 24 * 60 * 60 * 1000)
      : null;

    return this.prisma.$transaction(async (tx) => {
      const document = await tx.generatedDocument.create({
        data: {
          organizationId,
          branchId: dto.branchId ?? null,
          templateId: template.id,
          templateVersion: template.version,
          documentType: template.documentType,
          documentNumber,
          title: renderedTitle,
          status: GeneratedDocumentStatus.GENERATED,
          filePath: stored.filePath,
          mimeType: "application/pdf",
          sizeBytes: stored.sizeBytes,
          employeeId: dto.employeeId ?? null,
          vacationId: dto.vacationId ?? null,
          metadata: metadata as Prisma.InputJsonValue,
          generatedById: user.sub,
          retentionUntil,
        },
        include: { template: true },
      });

      await tx.documentAction.create({
        data: {
          documentId: document.id,
          action: DocumentActionType.GENERATED,
          userId: user.sub,
          details: { documentNumber, templateVersion: template.version },
        },
      });

      return document;
    });
  }

  // ==========================================================================
  // CONSULTA
  // ==========================================================================

  async findAll(filters: DocumentFilterDto, user: any) {
    const where: Prisma.GeneratedDocumentWhereInput = {
      organizationId: user.organizationId,
      ...(filters.documentType && { documentType: filters.documentType }),
      ...(filters.status && { status: filters.status }),
      ...(filters.employeeId && { employeeId: filters.employeeId }),
      ...(filters.branchId && { branchId: filters.branchId }),
      ...(filters.search && {
        OR: [
          { title: { contains: filters.search, mode: "insensitive" } },
          { documentNumber: { contains: filters.search, mode: "insensitive" } },
        ],
      }),
      ...((filters.dateFrom || filters.dateTo) && {
        createdAt: {
          ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
          ...(filters.dateTo && { lte: new Date(filters.dateTo) }),
        },
      }),
    };

    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(200, Math.max(1, Number(filters.limit) || 25));

    const [data, total] = await Promise.all([
      this.prisma.generatedDocument.findMany({
        where,
        include: {
          template: { select: { code: true, name: true, version: true } },
          employee: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.generatedDocument.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, user: any) {
    const document = await this.prisma.generatedDocument.findFirst({
      where: { id, organizationId: user.organizationId },
      include: {
        template: true,
        employee: { include: { user: true } },
        vacation: true,
        actions: { orderBy: { createdAt: "desc" } },
        substitutedBy: { select: { id: true, title: true, documentNumber: true, createdAt: true } },
      },
    });

    if (!document) {
      throw new NotFoundException("Documento no encontrado");
    }

    // Auditoría de consulta
    await this.prisma.documentAction.create({
      data: { documentId: id, action: DocumentActionType.VIEWED, userId: user.sub },
    });

    return document;
  }

  // ==========================================================================
  // DESCARGA
  // ==========================================================================

  async download(id: string, user: any) {
    const document = await this.prisma.generatedDocument.findFirst({
      where: { id, organizationId: user.organizationId },
    });

    if (!document) {
      throw new NotFoundException("Documento no encontrado");
    }

    if (document.status === GeneratedDocumentStatus.VOID) {
      throw new ForbiddenException("El documento fue anulado y no puede descargarse");
    }

    const buffer = await this.storage.read(document.filePath);

    // Auditoría de descarga
    await this.prisma.documentAction.create({
      data: { documentId: id, action: DocumentActionType.DOWNLOADED, userId: user.sub },
    });

    return {
      buffer,
      fileName: `${document.documentNumber || document.id}.pdf`,
      mimeType: document.mimeType,
    };
  }

  // ==========================================================================
  // SUSTITUCIÓN Y ANULACIÓN
  // ==========================================================================

  /**
   * Sustituye un documento: genera uno nuevo (con plantilla/valores actuales),
   * marca el anterior como SUBSTITUTED y vincula ambos. El anterior nunca se
   * modifica en su contenido.
   */
  async substitute(id: string, dto: GenerateDocumentDto, user: any) {
    const original = await this.prisma.generatedDocument.findFirst({
      where: { id, organizationId: user.organizationId },
    });

    if (!original) {
      throw new NotFoundException("Documento original no encontrado");
    }

    if (original.status === GeneratedDocumentStatus.VOID) {
      throw new BadRequestException("No se puede sustituir un documento anulado");
    }

    const replacement = await this.generate(
      {
        templateId: dto.templateId ?? original.templateId,
        employeeId: dto.employeeId ?? original.employeeId ?? undefined,
        vacationId: dto.vacationId ?? original.vacationId ?? undefined,
        branchId: dto.branchId ?? original.branchId ?? undefined,
        title: dto.title ?? original.title,
        values: dto.values,
      },
      user,
    );

    return this.prisma.$transaction(async (tx) => {
      const updatedOriginal = await tx.generatedDocument.update({
        where: { id: original.id },
        data: {
          status: GeneratedDocumentStatus.SUBSTITUTED,
          substitutedById: replacement.id,
        },
      });

      await tx.documentAction.create({
        data: {
          documentId: original.id,
          action: DocumentActionType.SUBSTITUTED,
          userId: user.sub,
          details: { replacementId: replacement.id },
        },
      });

      return { original: updatedOriginal, replacement };
    });
  }

  /** Anulación lógica del documento (conserva la copia y la auditoría). */
  async void(id: string, dto: VoidDocumentDto, user: any) {
    const document = await this.prisma.generatedDocument.findFirst({
      where: { id, organizationId: user.organizationId },
    });

    if (!document) {
      throw new NotFoundException("Documento no encontrado");
    }

    if (document.status === GeneratedDocumentStatus.VOID) {
      throw new BadRequestException("El documento ya fue anulado");
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.generatedDocument.update({
        where: { id },
        data: {
          status: GeneratedDocumentStatus.VOID,
          voidReason: dto.reason ?? null,
          voidedAt: new Date(),
        },
      });

      await tx.documentAction.create({
        data: {
          documentId: id,
          action: DocumentActionType.VOIDED,
          userId: user.sub,
          details: { reason: dto.reason ?? null },
        },
      });

      return updated;
    });
  }

  /** Historial auditable de un documento. */
  async getActions(id: string, user: any) {
    const document = await this.prisma.generatedDocument.findFirst({
      where: { id, organizationId: user.organizationId },
      select: { id: true },
    });

    if (!document) {
      throw new NotFoundException("Documento no encontrado");
    }

    return this.prisma.documentAction.findMany({
      where: { documentId: id },
      orderBy: { createdAt: "desc" },
    });
  }

  // ==========================================================================
  // RETENCIÓN
  // ==========================================================================

  /** Documentos vencidos por retención (para archivo/eliminación conforme a política). */
  async findExpiredForRetention() {
    return this.prisma.generatedDocument.findMany({
      where: {
        retentionUntil: { not: null, lt: new Date() },
        status: GeneratedDocumentStatus.GENERATED,
      },
    });
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private async assignDocumentNumber(templateId: string): Promise<{ documentNumber: string | null }> {
    return this.prisma.$transaction(async (tx) => {
      const template = await tx.documentTemplate.update({
        where: { id: templateId },
        data: { nextSequence: { increment: 1 } },
      });

      if (!template.numberingPrefix) {
        return { documentNumber: null };
      }

      const digits = template.numberingDigits ?? 6;
      const sequence = String(template.nextSequence - 1).padStart(digits, "0");
      return { documentNumber: `${template.numberingPrefix}${sequence}` };
    });
  }
}
