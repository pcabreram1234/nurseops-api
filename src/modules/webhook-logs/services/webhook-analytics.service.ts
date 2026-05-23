import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';

@Injectable()
export class WebhookAnalyticsService {
    constructor(private readonly prisma: PrismaService) { }

    async getFailureRate(integrationId: string) {
        const totalLogs = await this.prisma.webhookLog.count({ where: { integrationId } });
        return {
            integrationId,
            totalLogsProcessedHistorical: totalLogs,
            healthStatus: 'OPERATIONAL',
        };
    }
}