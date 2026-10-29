import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@infra/database/prisma.service";
import { AuditLogFilterDto } from "../dto/audit-log-filter.dto";

/**
 * Servicio de SOLO LECTURA sobre la tabla AuditLog.
 * No expone create/update/delete: los registros de auditoría son inmutables
 * desde la interfaz (solo se escriben por el pipeline del backend).
 */
@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(filters: AuditLogFilterDto, user: any) {
    const isSuper = user?.role === "SUPER";

    return {
      // Aislamiento organizacional: SUPER ve todo, el resto su organización
      ...(!isSuper && user?.organizationId && { organizationId: user.organizationId }),
      ...(filters.userId && { userId: filters.userId }),
      ...(filters.action && { action: filters.action }),
      ...(filters.moduleId && { moduleId: filters.moduleId }),
      ...(filters.requestId && { requestId: filters.requestId }),
      ...(filters.organizationId && isSuper && { organizationId: filters.organizationId }),
      ...(filters.fromDate || filters.toDate
        ? {
            createdAt: {
              ...(filters.fromDate && { gte: new Date(filters.fromDate) }),
              ...(filters.toDate && {
                // Inclusivo del día completo cuando llega solo YYYY-MM-DD
                lte: filters.toDate.length <= 10
                  ? new Date(new Date(filters.toDate).getTime() + 24 * 60 * 60 * 1000 - 1)
                  : new Date(filters.toDate),
              }),
            },
          }
        : {}),
    };
  }

  async findAll(filters: AuditLogFilterDto, user: any) {
    const where = this.buildWhere(filters, user);
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(200, Math.max(1, filters.limit ?? 25));

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          module: { select: { id: true, code: true, name: true } },
          organization: { select: { id: true, name: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, user: any) {
    const isSuper = user?.role === "SUPER";
    const log = await this.prisma.auditLog.findFirst({
      where: isSuper ? { id } : { id, organizationId: user?.organizationId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        module: { select: { id: true, code: true, name: true } },
        organization: { select: { id: true, name: true } },
      },
    });

    if (!log) throw new NotFoundException("Registro de auditoría no encontrado.");
    return log;
  }
}
