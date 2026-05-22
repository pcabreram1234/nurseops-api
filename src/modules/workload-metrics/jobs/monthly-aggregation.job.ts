import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@infra/database/prisma.service';
import { WorkloadAggregationService } from '../services/workload-aggregation.service';

@Injectable()
export class MonthlyAggregationJob {
    private readonly logger = new Logger(MonthlyAggregationJob.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly aggregationService: WorkloadAggregationService,
    ) { }

    @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
    async execute() {
        this.logger.log('Month-end closing detected. Consolidating final workload metrics...');
        const now = new Date();
        const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth();
        const targetYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

        const activeNurses = await this.prisma.nurse.findMany({ where: { status: 'ACTIVE' } });

        for (const nurse of activeNurses) {
            try {
                await this.aggregationService.aggregateNurseMonthlyMetrics(nurse.id, nurse.organizationId, prevMonth, targetYear);
            } catch (error: any) {
                this.logger.error(`Error consolidating metrics for nurse ${nurse.id}: ${error.message}`);
            }
        }
    }
}