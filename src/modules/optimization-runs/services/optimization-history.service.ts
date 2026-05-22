import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';

@Injectable()
export class OptimizationHistoryService {
    constructor(private readonly prisma: PrismaService) { }

    async getHistoricalSummary(scheduleId: string) {
        return this.prisma.optimizationRun.findMany({
            where: { scheduleId },
            orderBy: { startedAt: 'desc' },
        });
    }
}