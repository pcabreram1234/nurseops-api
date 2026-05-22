import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ALERT_SYSTEM_LISTENERS } from '../constants/operational-alerts.constants';
import { AlertDetectionService } from '../services/alert-detection.service';

@Injectable()
export class StaffingShortageListener {
    constructor(private readonly detectionService: AlertDetectionService) { }

    @OnEvent(ALERT_SYSTEM_LISTENERS.STAFFING_SHORTAGE)
    async handleShortage(payload: { departmentId: string; missingStaffCount: number }) {
        await this.detectionService.triggerAutomatedAlert(payload.departmentId, 'STAFFING_SHORTAGE' as any, payload);
    }
}