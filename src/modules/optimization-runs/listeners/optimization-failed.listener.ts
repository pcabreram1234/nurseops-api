import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OPTIMIZATION_EVENTS } from '../constants/optimization-runs.constants';
import { OptimizationFailedEvent } from '../events/optimization-failed.event';

@Injectable()
export class OptimizationFailedListener {
    private readonly logger = new Logger(OptimizationFailedListener.name);

    @OnEvent(OPTIMIZATION_EVENTS.FAILED)
    handleFailedRun(event: OptimizationFailedEvent) {
        this.logger.error(`[SYSTEM ALERT]: The engine failed to process Schedule ${event.scheduleId}. Reason: ${event.errorReason}`);
    }
}