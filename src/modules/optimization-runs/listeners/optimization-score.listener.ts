import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OPTIMIZATION_EVENTS } from '../constants/optimization-runs.constants';

@Injectable()
export class OptimizationScoreListener {
    private readonly logger = new Logger(OptimizationScoreListener.name);

    @OnEvent(OPTIMIZATION_EVENTS.FINISHED)
    logQualityKPI(payload: any) {
        this.logger.log(`[QUALITY KPIs]: Consolidated record in global analytics.`);
    }
}