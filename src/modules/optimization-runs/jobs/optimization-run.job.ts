import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class OptimizationRunJob {
    private readonly logger = new Logger(OptimizationRunJob.name);

    @Cron(CronExpression.EVERY_HOUR)
    executeBatchSolver() {
        this.logger.log('Looking for draft clinical quadrants ready for automated mass nighttime optimization...');
    }
}