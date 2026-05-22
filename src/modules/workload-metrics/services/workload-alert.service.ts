import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WORKLOAD_EVENTS } from '../constants/workload-metrics.constants';
import { BurnoutDetectedEvent } from '../events/burnout-detected.event';
import { FatigueThresholdReachedEvent } from '../events/fatigue-threshold-reached.event';

@Injectable()
export class WorkloadAlertService {
    private readonly logger = new Logger(WorkloadAlertService.name);

    constructor(private readonly eventEmitter: EventEmitter2) { }

    async triggerCriticalAlerts(nurseId: string, orgId: string, scores: { fatigue: number; burnout: number }) {
        if (scores.fatigue >= 85) {
            this.logger.warn(`[OPERATIONAL ALERT]: Extreme fatigue detected in nurse ${nurseId}`);
            this.eventEmitter.emit(WORKLOAD_EVENTS.FATIGUE_THRESHOLD_REACHED, new FatigueThresholdReachedEvent(nurseId, scores.fatigue));
        }

        if (scores.burnout >= 75) {
            this.logger.error(`[OCCUPATIONAL HEALTH ALERT]: Critical Risk of Burnout in Nursing ${nurseId}`);
            this.eventEmitter.emit(WORKLOAD_EVENTS.BURNOUT_DETECTED, new BurnoutDetectedEvent(nurseId, orgId, scores.burnout));
        }
    }
}