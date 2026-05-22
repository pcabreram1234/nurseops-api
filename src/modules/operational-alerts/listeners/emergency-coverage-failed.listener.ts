import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ALERT_SYSTEM_LISTENERS } from '../constants/operational-alerts.constants';
import { AlertDetectionService } from '../services/alert-detection.service';

@Injectable()
export class EmergencyCoverageFailedListener {
    constructor(private readonly detectionService: AlertDetectionService) { }

    @OnEvent(ALERT_SYSTEM_LISTENERS.EMERGENCY_COVERAGE_FAILED)
    async handleEmergencyFailed(payload: { departmentId: string; shiftId: string }) {
        await this.detectionService.triggerAutomatedAlert(payload.departmentId, 'EMERGENCY_COVERAGE_FAILED' as any, payload);
    }
}