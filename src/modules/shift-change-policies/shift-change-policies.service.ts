import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "@infra/database/prisma.service";

export interface ShiftChangePolicyDto {
  organizationId: string;
  branchId?: string;
  departmentId?: string;
  enabled?: boolean;
  allowSwap?: boolean;
  allowTransfer?: boolean;
  allowCoverage?: boolean;
  allowCrossDepartment?: boolean;
  allowCrossBranch?: boolean;
  requireJustification?: boolean;
  requireDocument?: boolean;
  requireSupervisorApproval?: boolean;
  requireHrApproval?: boolean;
  minAdvanceHours?: number;
  maxAdvanceDays?: number;
  autoExpireHours?: number;
  maxSimultaneousRequests?: number;
  allowMultipleApplications?: boolean;
}

export interface ShiftChangePolicyFilterDto {
  organizationId?: string;
  branchId?: string;
  departmentId?: string;
  enabled?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class ShiftChangePoliciesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: ShiftChangePolicyDto, user: any) {
    const organizationId = user.role === "SUPER" ? dto.organizationId : user.organizationId;

    if (user.role !== "SUPER" && dto.organizationId && dto.organizationId !== user.organizationId) {
      throw new ForbiddenException("No puede crear políticas para otra organización.");
    }

    // Verificar que no exista ya una política para la misma combinación
    const existing = await this.prisma.shiftChangePolicy.findFirst({
      where: {
        organizationId,
        ...(dto.branchId && { branchId: dto.branchId }),
        ...(dto.departmentId && { departmentId: dto.departmentId }),
      },
    });

    if (existing) {
      throw new BadRequestException(
        "Ya existe una política para esta combinación de organización/sede/departamento.",
      );
    }

    return this.prisma.shiftChangePolicy.create({
      data: {
        organizationId,
        ...(dto.branchId && { branchId: dto.branchId }),
        ...(dto.departmentId && { departmentId: dto.departmentId }),
        enabled: dto.enabled ?? true,
        allowSwap: dto.allowSwap ?? true,
        allowTransfer: dto.allowTransfer ?? true,
        allowCoverage: dto.allowCoverage ?? true,
        allowCrossDepartment: dto.allowCrossDepartment ?? false,
        allowCrossBranch: dto.allowCrossBranch ?? false,
        requireJustification: dto.requireJustification ?? true,
        requireDocument: dto.requireDocument ?? false,
        requireSupervisorApproval: dto.requireSupervisorApproval ?? true,
        requireHrApproval: dto.requireHrApproval ?? false,
        minAdvanceHours: dto.minAdvanceHours ?? 24,
        maxAdvanceDays: dto.maxAdvanceDays ?? 90,
        autoExpireHours: dto.autoExpireHours ?? 48,
        maxSimultaneousRequests: dto.maxSimultaneousRequests ?? 3,
        allowMultipleApplications: dto.allowMultipleApplications ?? false,
      },
    });
  }

  async findAll(filters: ShiftChangePolicyFilterDto, user: any) {
    const where: any = {};

    if (user.role !== "SUPER") {
      where.organizationId = user.organizationId;
    } else if (filters.organizationId) {
      where.organizationId = filters.organizationId;
    }

    if (filters.branchId) where.branchId = filters.branchId;
    if (filters.departmentId) where.departmentId = filters.departmentId;
    if (filters.enabled !== undefined) where.enabled = filters.enabled;

    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 25));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.shiftChangePolicy.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          organization: { select: { id: true, name: true, code: true } },
          branch: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } },
        },
      }),
      this.prisma.shiftChangePolicy.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, user: any) {
    const isSuperAdmin = user.role === "SUPER";

    const policy = await this.prisma.shiftChangePolicy.findFirst({
      where: isSuperAdmin ? { id } : { id, organizationId: user.organizationId },
      include: {
        organization: { select: { id: true, name: true, code: true } },
        branch: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });

    if (!policy) {
      throw new NotFoundException("Política de cambio de turno no encontrada.");
    }

    return policy;
  }

  async update(id: string, dto: Partial<ShiftChangePolicyDto>, user: any) {
    const isSuperAdmin = user.role === "SUPER";

    const existing = await this.prisma.shiftChangePolicy.findFirst({
      where: isSuperAdmin ? { id } : { id, organizationId: user.organizationId },
    });

    if (!existing) {
      throw new NotFoundException("Política de cambio de turno no encontrada.");
    }

    return this.prisma.shiftChangePolicy.update({
      where: { id },
      data: {
        ...(dto.enabled !== undefined && { enabled: dto.enabled }),
        ...(dto.allowSwap !== undefined && { allowSwap: dto.allowSwap }),
        ...(dto.allowTransfer !== undefined && { allowTransfer: dto.allowTransfer }),
        ...(dto.allowCoverage !== undefined && { allowCoverage: dto.allowCoverage }),
        ...(dto.allowCrossDepartment !== undefined && { allowCrossDepartment: dto.allowCrossDepartment }),
        ...(dto.allowCrossBranch !== undefined && { allowCrossBranch: dto.allowCrossBranch }),
        ...(dto.requireJustification !== undefined && { requireJustification: dto.requireJustification }),
        ...(dto.requireDocument !== undefined && { requireDocument: dto.requireDocument }),
        ...(dto.requireSupervisorApproval !== undefined && { requireSupervisorApproval: dto.requireSupervisorApproval }),
        ...(dto.requireHrApproval !== undefined && { requireHrApproval: dto.requireHrApproval }),
        ...(dto.minAdvanceHours !== undefined && { minAdvanceHours: dto.minAdvanceHours }),
        ...(dto.maxAdvanceDays !== undefined && { maxAdvanceDays: dto.maxAdvanceDays }),
        ...(dto.autoExpireHours !== undefined && { autoExpireHours: dto.autoExpireHours }),
        ...(dto.maxSimultaneousRequests !== undefined && { maxSimultaneousRequests: dto.maxSimultaneousRequests }),
        ...(dto.allowMultipleApplications !== undefined && { allowMultipleApplications: dto.allowMultipleApplications }),
      },
      include: {
        organization: { select: { id: true, name: true, code: true } },
        branch: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });
  }

  async remove(id: string, user: any) {
    const isSuperAdmin = user.role === "SUPER";

    const existing = await this.prisma.shiftChangePolicy.findFirst({
      where: isSuperAdmin ? { id } : { id, organizationId: user.organizationId },
    });

    if (!existing) {
      throw new NotFoundException("Política de cambio de turno no encontrada.");
    }

    return this.prisma.shiftChangePolicy.delete({ where: { id } });
  }

  /**
   * Obtiene la política aplicable para una organización/sede/departamento dada.
   * Prioridad: departamento > sede > organización.
   */
  async getApplicablePolicy(organizationId: string, branchId?: string, departmentId?: string) {
    // 1. Buscar política específica de departamento
    if (departmentId) {
      const deptPolicy = await this.prisma.shiftChangePolicy.findFirst({
        where: {
          organizationId,
          departmentId,
          branchId: branchId || undefined,
          enabled: true,
        },
      });
      if (deptPolicy) return deptPolicy;
    }

    // 2. Buscar política específica de sede
    if (branchId) {
      const branchPolicy = await this.prisma.shiftChangePolicy.findFirst({
        where: {
          organizationId,
          branchId,
          departmentId: null,
          enabled: true,
        },
      });
      if (branchPolicy) return branchPolicy;
    }

    // 3. Buscar política de organización (sin sede ni departamento)
    const orgPolicy = await this.prisma.shiftChangePolicy.findFirst({
      where: {
        organizationId,
        branchId: null,
        departmentId: null,
        enabled: true,
      },
    });
    if (orgPolicy) return orgPolicy;

    // 4. Valores por defecto
    return {
      enabled: true,
      allowSwap: true,
      allowTransfer: true,
      allowCoverage: true,
      allowCrossDepartment: false,
      allowCrossBranch: false,
      requireJustification: true,
      requireDocument: false,
      requireSupervisorApproval: true,
      requireHrApproval: false,
      minAdvanceHours: 24,
      maxAdvanceDays: 90,
      autoExpireHours: 48,
      maxSimultaneousRequests: 3,
      allowMultipleApplications: false,
    };
  }
}
