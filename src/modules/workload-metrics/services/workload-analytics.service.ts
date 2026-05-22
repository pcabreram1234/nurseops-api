import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';
import { WorkloadSummaryDto } from '../dto/workload-summary.dto';

@Injectable()
export class WorkloadAnalyticsService {
    constructor(private readonly prisma: PrismaService) { }

    async getOrganizationDashboard(dto: WorkloadSummaryDto) {
        const metrics = await this.prisma.workLoadMetrics.findMany({
            where: {
                organizationId: dto.organizationId,
                month: dto.month,
                year: dto.year,
            },
        });

        if (metrics.length === 0) return { totalNursesAnalyzed: 0, message: 'No records for this cycle.' };

        const totalNurses = metrics.length;
        let totalFatigue = 0;
        let criticalBurnout = 0;

        metrics.forEach((m) => {
            totalFatigue += m.fatigue_score.toNumber();
            if (m.burnout_risk.toNumber() >= 75) criticalBurnout++;
        });

        return {
            organizationId: dto.organizationId,
            month: dto.month,
            year: dto.year,
            totalNursesAnalyzed: totalNurses,
            criticalBurnoutCount: criticalBurnout,
            averageFatigueScore: parseFloat((totalFatigue / totalNurses).toFixed(2)),
        };
    }
}