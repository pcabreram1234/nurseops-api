import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@infra/database/prisma.service';
import { ModuleCacheService } from '../services/module-cache.service';

@Injectable()
export class ModuleCacheSyncJob {
    private readonly logger = new Logger(ModuleCacheSyncJob.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly cache: ModuleCacheService,
    ) { }

    @Cron(CronExpression.EVERY_HOUR)
    async execute() {
        this.logger.log('Preventively synchronizing the global module cache...');
        const currentModules = await this.prisma.module.findMany({ where: { isActive: true } });
        await this.cache.setCachedModules(currentModules);
    }
}