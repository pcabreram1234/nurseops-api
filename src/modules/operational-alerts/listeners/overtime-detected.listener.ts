import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ALERT_SYSTEM_LISTENERS } from '../constants/operational-alerts.constants';
import { AlertDetectionService } from '../services/alert-detection.service';

@Injectable()
export class OvertimeDetectedListener {
    constructor(private readonly detectionService: AlertDetectionService) { }

    @OnEvent(ALERT_SYSTEM_LISTENERS.OVERTIME_DETECTED)
    async handleOvertimeDetected(payload: { departmentId: string; nurseId: string; hours: number }) {
        if (payload.hours > 12) {
            await this.detectionService.triggerAutomatedAlert(payload.departmentId, 'OVERTIME_WARNING' as any, payload);
        }
    }
}