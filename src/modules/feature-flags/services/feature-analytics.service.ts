import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';

@Injectable()
export class FeatureAnalyticsService {
    private readonly logger = new Logger(FeatureAnalyticsService.name);

    constructor(private readonly prisma: PrismaService) { }

    async getSummaryMetrics() {
        const totalFlags = await this.prisma.featureFlag.count();
        const activeFlags = await this.prisma.featureFlag.count({ where: { isActive: true } });

        return {
            systemTime: new Date(),
            totalFlagsRegistered: totalFlags,
            activeFlagsCount: activeFlags,
            inactiveFlagsCount: totalFlags - activeFlags,
        };
    }
}