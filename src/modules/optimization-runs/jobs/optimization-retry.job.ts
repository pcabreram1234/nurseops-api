import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class OptimizationRetryJob {
    private readonly logger = new Logger(OptimizationRetryJob.name);

    @Cron(CronExpression.EVERY_30_MINUTES)
    checkStalledProcessingRuns() {
        this.logger.log('Searching for unresolved issues in combinatorial processing for preventative retry...');
    }
}