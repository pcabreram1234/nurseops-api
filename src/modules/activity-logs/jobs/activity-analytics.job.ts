import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ActivityAnalyticsService } from '../services/activity-analytics.service';

@Injectable()
export class ActivityAnalyticsJob {
    private readonly logger = new Logger(ActivityAnalyticsJob.name);

    constructor(private readonly analyticsService: ActivityAnalyticsService) { }

    @Cron(CronExpression.EVERY_HOUR)
    async execute() {
        this.logger.log('Synchronizing the analytical engine for fatigue events and critical loads...');
        const result = await this.analyticsService.generateDailyMetrics();
        this.logger.debug(`Calculated metrics: ${result.totalLogsProcessed} processed operations.`);
    }
}