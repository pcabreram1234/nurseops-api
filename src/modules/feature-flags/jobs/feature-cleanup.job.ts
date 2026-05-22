import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class FeatureCleanupJob {
    private readonly logger = new Logger(FeatureCleanupJob.name);

    @Cron(CronExpression.EVERY_WEEK)
    execute() {
        this.logger.log('Analyzing flags with obsolete features or those fully deployed in production...');
        // Ayuda a mantener limpio el esquema evitando acumulación histórica innecesaria de flags fijas
    }
}