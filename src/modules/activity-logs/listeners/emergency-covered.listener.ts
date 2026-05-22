import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SYSTEM_INTEGRATION_EVENTS } from '../constants/activity-logs.constants';
import { ActivityLogsService } from '../services/activity-logs.service';

@Injectable()
export class EmergencyCoveredListener {
    constructor(private readonly logsService: ActivityLogsService) { }

    @OnEvent(SYSTEM_INTEGRATION_EVENTS.EMERGENCY_COVERED)
    async handleEmergencyCovered(payload: { replacementNurseId: string; absentNurseId: string; shiftId: string }) {
        await this.logsService.create({
            userId: payload.replacementNurseId,
            action: 'EMERGENCY_COVERED' as any,
            details: {
                shiftId: payload.shiftId,
                withdrawnNurseId: payload.absentNurseId,
                matchingEngineType: 'AUTOMATED_FALLBACK',
            },
        });
    }
}