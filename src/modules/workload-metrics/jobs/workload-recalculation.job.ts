import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class WorkloadRecalculationJob {
    private readonly logger = new Logger(WorkloadRecalculationJob.name);

    @Cron(CronExpression.EVERY_DAY_AT_3AM)
    async execute() {
        this.logger.log('Initiating preventive asynchronous recalculation of hospital staff fatigue...');
    }
}