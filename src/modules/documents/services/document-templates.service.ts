import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "@infra/database/prisma.service";
import { CreateDocumentTemplateDto, UpdateDocumentTemplateDto } from "../dto";

@Injectable()
export class DocumentTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(user: any, filters?: { documentType?: string; status?: string }) {
    return this.prisma.documentTemplate.findMany({
      where: {
        organizationId: user.organizationId,
        ...(filters?.documentType && { documentType: filters.documentType }),
        ...(filters?.status && { status: filters.status as any }),
      },
      orderBy: [{ documentType: "asc" }, { code: "asc" }, { version: "desc" }],
    });
  }

  async findOne(id: string, user: any) {
    const template = await this.prisma.documentTemplate.findFirst({
      where: { id, organizationId: user.organizationId },
    });

    if (!template) {
      throw new NotFoundException("Plantilla de documento no encontrada");
    }

    return template;
  }

  async create(dto: CreateDocumentTemplateDto, user: any) {
    const existing = await this.prisma.documentTemplate.findFirst({
      where: { organizationId: user.organizationId, code: dto.code },
      orderBy: { version: "desc" },
    });

    if (existing && existing.status !== "ARCHIVED") {
      throw new BadRequestException(
        "Ya existe una plantilla con ese código. Use la actualización para crear una nueva versión.",
      );
    }

    return this.prisma.documentTemplate.create({
      data: {
        organizationId: user.organizationId,
        branchId: dto.branchId,
        code: dto.code,
        name: dto.name,
        description: dto.description,
        documentType: dto.documentType,
        format: dto.format ?? "PDF",
        header: dto.header ?? undefined,
        body: dto.body,
        footer: dto.footer ?? undefined,
        logoPath: dto.logoPath,
        fields: dto.fields ?? undefined,
        numberingPrefix: dto.numberingPrefix,
        numberingDigits: dto.numberingDigits,
        signatureBlocks: dto.signatureBlocks ?? undefined,
        isDefault: dto.isDefault ?? false,
        retentionDays: dto.retentionDays,
        createdById: user.sub,
      },
    });
  }

  /**
   * Actualización con versionado: si la plantilla está ACTIVE, se crea una
   * nueva versión que la superse dea (los documentos históricos conservan la
   * versión congelada de la plantilla usada).
   */
  async update(id: string, dto: UpdateDocumentTemplateDto, user: any) {
    const current = await this.findOne(id, user);

    if (current.status === "ACTIVE") {
      const newVersion = await this.prisma.documentTemplate.create({
        data: {
          organizationId: current.organizationId,
          branchId: dto.branchId ?? current.branchId,
          code: current.code,
          name: dto.name ?? current.name,
          description: dto.description ?? current.description,
          documentType: current.documentType,
          format: dto.format ?? current.format,
          header: dto.header ?? (current.header as any),
          body: dto.body ?? current.body,
          footer: dto.footer ?? (current.footer as any),
          logoPath: dto.logoPath ?? current.logoPath,
          fields: dto.fields ?? (current.fields as any),
          numberingPrefix: dto.numberingPrefix ?? current.numberingPrefix,
          numberingDigits: dto.numberingDigits ?? current.numberingDigits,
          nextSequence: current.nextSequence,
          signatureBlocks: dto.signatureBlocks ?? (current.signatureBlocks as any),
          isDefault: false,
          status: "DRAFT",
          version: current.version + 1,
          effectiveFrom: new Date(),
          supersedesTemplateId: current.id,
          retentionDays: dto.retentionDays ?? current.retentionDays,
          createdById: user.sub,
        },
      });

      // La versión anterior deja de estar vigente
      await this.prisma.documentTemplate.update({
        where: { id: current.id },
        data: { effectiveTo: new Date(), isDefault: false },
      });

      return newVersion;
    }

    return this.prisma.documentTemplate.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.format && { format: dto.format }),
        ...(dto.header !== undefined && { header: dto.header ?? undefined }),
        ...(dto.body && { body: dto.body }),
        ...(dto.footer !== undefined && { footer: dto.footer ?? undefined }),
        ...(dto.logoPath !== undefined && { logoPath: dto.logoPath }),
        ...(dto.fields !== undefined && { fields: dto.fields ?? undefined }),
        ...(dto.numberingPrefix !== undefined && { numberingPrefix: dto.numberingPrefix }),
        ...(dto.numberingDigits !== undefined && { numberingDigits: dto.numberingDigits }),
        ...(dto.signatureBlocks !== undefined && { signatureBlocks: dto.signatureBlocks ?? undefined }),
        ...(dto.retentionDays !== undefined && { retentionDays: dto.retentionDays }),
        ...(dto.branchId !== undefined && { branchId: dto.branchId }),
      },
    });
  }

  async activate(id: string, user: any) {
    const template = await this.findOne(id, user);

    if (template.status === "ACTIVE") {
      throw new BadRequestException("La plantilla ya está activa");
    }

    return this.prisma.documentTemplate.update({
      where: { id },
      data: { status: "ACTIVE", effectiveFrom: new Date() },
    });
  }

  /** Marca la plantilla como predeterminada para su tipo (desmarca las demás). */
  async setDefault(id: string, user: any) {
    const template = await this.findOne(id, user);

    if (template.status !== "ACTIVE") {
      throw new BadRequestException("Solo plantillas activas pueden ser predeterminadas");
    }

    await this.prisma.documentTemplate.updateMany({
      where: {
        organizationId: user.organizationId,
        documentType: template.documentType,
        isDefault: true,
      },
      data: { isDefault: false },
    });

    return this.prisma.documentTemplate.update({
      where: { id },
      data: { isDefault: true },
    });
  }

  async archive(id: string, user: any) {
    const template = await this.findOne(id, user);

    return this.prisma.documentTemplate.update({
      where: { id },
      data: { status: "ARCHIVED", isDefault: false, effectiveTo: new Date() },
    });
  }
}
