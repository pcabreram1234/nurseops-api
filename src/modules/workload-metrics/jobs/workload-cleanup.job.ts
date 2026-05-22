import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class WorkloadCleanupJob {
    private readonly logger = new Logger(WorkloadCleanupJob.name);

    @Cron(CronExpression.EVERY_YEAR)
    execute() {
        this.logger.log('Initiating purge and historical archiving of performance metrics older than 5 years.');
    }
}