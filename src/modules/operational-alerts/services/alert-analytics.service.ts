import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';

@Injectable()
export class AlertAnalyticsService {
    constructor(private readonly prisma: PrismaService) { }

    async getMetricsByDepartment(departmentId: string) {
        const records = await this.prisma.operationalAlert.findMany({
            where: { departmentId },
        });

        const active = records.filter((r) => r.status === 'IN_PROGRESS').length;
        const resolved = records.filter((r) => r.status === 'RESOLVED').length;

        return {
            departmentId,
            totalAlertsHistorical: records.length,
            currentActiveCount: active,
            resolvedCount: resolved,
        };
    }
}