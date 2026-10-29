import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';
import { OperationalAlertFilterDto } from '../dto/operational-alert-filter.dto';

@Injectable()
export class OperationalAlertsService {
    constructor(private readonly prisma: PrismaService) { }

    /** Where compartido entre findAll y stats. */
    private buildWhere(filters: OperationalAlertFilterDto) {
        return {
            ...(filters.departmentId && { departmentId: filters.departmentId }),
            ...(filters.status && { status: filters.status }),
            ...(filters.severity && { severity: filters.severity }),
            ...(filters.search && {
                message: { contains: filters.search, mode: 'insensitive' as const },
            }),
        };
    }

    /** Agregados por estado y severidad para los indicadores del dashboard. */
    async stats(filters: OperationalAlertFilterDto) {
        const where = this.buildWhere(filters);

        const [total, byStatus, bySeverity, criticalOpen] = await Promise.all([
            this.prisma.operationalAlert.count({ where }),
            this.prisma.operationalAlert.groupBy({
                by: ['status'],
                where,
                _count: { _all: true },
            }),
            this.prisma.operationalAlert.groupBy({
                by: ['severity'],
                where,
                _count: { _all: true },
            }),
            this.prisma.operationalAlert.count({
                where: { ...where, severity: { in: ['CRITICAL', 'URGENT'] }, status: { not: 'RESOLVED' } },
            }),
        ]);

        const statusCounts: Record<string, number> = {};
        for (const r of byStatus) statusCounts[r.status] = r._count._all;
        const severityCounts: Record<string, number> = {};
        for (const r of bySeverity) severityCounts[r.severity] = r._count._all;

        return {
            total,
            open: statusCounts['OPEN'] ?? 0,
            inProgress: statusCounts['IN_PROGRESS'] ?? 0,
            resolved: statusCounts['RESOLVED'] ?? 0,
            ignored: statusCounts['IGNORED'] ?? 0,
            escalated: statusCounts['ESCALATED'] ?? 0,
            criticalOpen,
            statusCounts,
            severityCounts,
        };
    }

    async findAll(filters: OperationalAlertFilterDto) {
        const where = this.buildWhere(filters);

        const include = {
            department: { select: { id: true, name: true } },
        };

        const orderBy = [
            { severity: 'desc' as const },
            { createdAt: 'desc' as const },
        ];

        // Paginación opcional: sin page/limit se mantiene el array plano
        // (backward compatible con los consumidores existentes de este service)
        if (filters.page || filters.limit) {
            const page = Math.max(1, filters.page ?? 1);
            const limit = Math.min(500, Math.max(1, filters.limit ?? 25));
            const [data, total] = await Promise.all([
                this.prisma.operationalAlert.findMany({
                    where,
                    include,
                    orderBy,
                    skip: (page - 1) * limit,
                    take: limit,
                }),
                this.prisma.operationalAlert.count({ where }),
            ]);
            return {
                data,
                meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
            };
        }

        return this.prisma.operationalAlert.findMany({ where, include, orderBy });
    }

    async findOne(id: string) {
        const alert = await this.prisma.operationalAlert.findUnique({
            where: { id },
            include: { department: { select: { id: true, name: true } } },
        });
        if (!alert) throw new NotFoundException('Non-existent operational alert.');
        return alert;
    }
}
