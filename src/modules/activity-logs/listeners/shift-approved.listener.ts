import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SYSTEM_INTEGRATION_EVENTS } from '../constants/activity-logs.constants';
import { ActivityLogsService } from '../services/activity-logs.service';
import { ActivityLogType } from '@prisma/client';

@Injectable()
export class ShiftApprovedListener {
    constructor(private readonly logsService: ActivityLogsService) { }

    @OnEvent(SYSTEM_INTEGRATION_EVENTS.SHIFT_APPROVED)
    async handleShiftApproved(payload: { shiftId: string; approvedById: string; nurseId: string }) {
        await this.logsService.create({
            userId: payload.approvedById,
            action: ActivityLogType.SHIFT_APPROVED || ('SHIFT_APPROVED' as any),
            details: {
                shiftId: payload.shiftId,
                assignedNurseId: payload.nurseId,
                message: 'Intercambio o guardia aprobado por el supervisor clínico.',
            },
        });
    }
}