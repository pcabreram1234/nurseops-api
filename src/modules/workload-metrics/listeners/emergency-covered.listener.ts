import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WORKLOAD_SYSTEM_LISTENERS } from '../constants/workload-metrics.constants';

@Injectable()
export class EmergencyCoveredListener {
    private readonly logger = new Logger(EmergencyCoveredListener.name);

    @OnEvent(WORKLOAD_SYSTEM_LISTENERS.EMERGENCY_COVERED)
    handleEmergencyCovered(payload: { replacementNurseId: string; hoursAdded: number }) {
        this.logger.warn(
            `[METRICS]: Emergency Room Alert. The nurse ${payload.replacementNurseId} accumulated ${payload.hoursAdded}h unforeseen.`,
        );
    }
}