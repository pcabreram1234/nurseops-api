import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ActivityAggregationJob {
    private readonly logger = new Logger(ActivityAggregationJob.name);

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async execute() {
        this.logger.log('Compiling the daily transactional history of personnel activities...');
        // Lógica para consolidar KPIs operacionales y aliviar lecturas complejas a la base de datos centralizada.
    }
}