import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WORKLOAD_SYSTEM_LISTENERS, WORKLOAD_EVENTS } from '../constants/workload-metrics.constants';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OvertimeLimitReachedEvent } from '../events/overtime-limit-reached.event';

@Injectable()
export class OvertimeDetectedListener {
    constructor(private readonly eventEmitter: EventEmitter2) { }

    @OnEvent(WORKLOAD_SYSTEM_LISTENERS.OVERTIME_DETECTED)
    handleOvertimeDetected(payload: { nurseId: string; accumulatedOvertime: number }) {
        if (payload.accumulatedOvertime >= 40) {
            this.eventEmitter.emit(
                WORKLOAD_EVENTS.OVERTIME_LIMIT_REACHED,
                new OvertimeLimitReachedEvent(payload.nurseId, payload.accumulatedOvertime, new Date().getMonth() + 1),
            );
        }
    }
}