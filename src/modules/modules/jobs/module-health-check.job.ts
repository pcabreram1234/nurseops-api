import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@infra/database/prisma.service';
import { ModuleHealthService } from '../services/module-health.service';

@Injectable()
export class ModuleHealthCheckJob {
    private readonly logger = new Logger(ModuleHealthCheckJob.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly healthService: ModuleHealthService,
    ) { }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async execute() {
        this.logger.log('Initiating cyclical modular health monitoring...');
        const activeModules = await this.prisma.module.findMany({ where: { isActive: true } });

        for (const mod of activeModules) {
            const report = await this.healthService.checkHealth(mod.code);
            if (report.issues.length > 0) {
                this.logger.warn(`Module issues ${mod.code}: ${report.issues.join(', ')}`);
            }
        }
    }
}