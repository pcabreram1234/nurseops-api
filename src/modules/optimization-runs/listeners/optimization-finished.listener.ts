import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OPTIMIZATION_EVENTS } from '../constants/optimization-runs.constants';
import { OptimizationFinishedEvent } from '../events/optimization-finished.event';

@Injectable()
export class OptimizationFinishedListener {
    private readonly logger = new Logger(OptimizationFinishedListener.name);

    @OnEvent(OPTIMIZATION_EVENTS.FINISHED)
    handleFinishedRun(event: OptimizationFinishedEvent) {
        this.logger.log(`[NOTIFICATION]: Run ${event.runId} for Schedule ${event.scheduleId} completed successfully.`);
    }
}