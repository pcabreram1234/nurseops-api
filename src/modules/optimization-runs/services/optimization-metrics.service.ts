import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';

@Injectable()
export class OptimizationMetricsService {
    constructor(private readonly prisma: PrismaService) { }

    async getGlobalAnalytics() {
        const totalRuns = await this.prisma.optimizationRun.count();
        return {
            totalOptimizationRunsHistorical: totalRuns,
            engineHealthStatus: 'OPERATIONAL',
        };
    }
}