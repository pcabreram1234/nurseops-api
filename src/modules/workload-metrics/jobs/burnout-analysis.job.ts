import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BurnoutAnalysisJob {
    private readonly logger = new Logger(BurnoutAnalysisJob.name);

    @Cron(CronExpression.EVERY_12_HOURS)
    execute() {
        this.logger.log('Running predictive analytical processes for latent risk of clinical burnout...');
    }
}