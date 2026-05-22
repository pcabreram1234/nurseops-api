import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class OptimizationAnalysisJob {
    private readonly logger = new Logger(OptimizationAnalysisJob.name);

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    executeDailyAnalyticsConsolidation() {
        this.logger.log('Synchronizing daily algorithmic latency and resolution efficiency indices.');
    }
}