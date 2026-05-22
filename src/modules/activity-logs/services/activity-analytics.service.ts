import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';

@Injectable()
export class ActivityAnalyticsService {
    constructor(private readonly prisma: PrismaService) { }

    async generateDailyMetrics() {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const logs = await this.prisma.activityLog.findMany({
            where: { createdAt: { gte: twentyFourHoursAgo } },
            select: { action: true },
        });

        const counts = logs.reduce((acc, log) => {
            acc[log.action] = (acc[log.action] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            period: '24H',
            totalLogsProcessed: logs.length,
            distribution: counts,
        };
    }
}