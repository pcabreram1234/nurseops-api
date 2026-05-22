import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ALERT_SYSTEM_LISTENERS } from '../constants/operational-alerts.constants';
import { AlertDetectionService } from '../services/alert-detection.service';

@Injectable()
export class BurnoutDetectedListener {
    constructor(private readonly detectionService: AlertDetectionService) { }

    @OnEvent(ALERT_SYSTEM_LISTENERS.BURNOUT_DETECTED)
    async handleBurnoutAlert(payload: { organizationId: string; nurseId: string; riskScore: number }) {
        // Nota: Como no viene el depto de forma directa, se enruta a un depto genérico o de control de personal
        const defaultClinicalDept = 'CORE_HR_DEPT';
        await this.detectionService.triggerAutomatedAlert(defaultClinicalDept, 'BURNOUT_CRITICAL' as any, payload);
    }
}