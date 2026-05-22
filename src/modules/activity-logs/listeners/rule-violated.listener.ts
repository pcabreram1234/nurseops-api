import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SYSTEM_INTEGRATION_EVENTS } from '../constants/activity-logs.constants';
import { ActivityLogsService } from '../services/activity-logs.service';
import { ActivityLogType } from '@prisma/client';

@Injectable()
export class RuleViolatedListener {
    constructor(private readonly logsService: ActivityLogsService) { }

    @OnEvent(SYSTEM_INTEGRATION_EVENTS.RULE_VIOLATED)
    async handleRuleViolated(payload: { userId: string; ruleCode: string; restrictionDetails: any }) {
        await this.logsService.create({
            userId: payload.userId,
            action: ActivityLogType.RULE_VIOLATED || ('RULE_VIOLATED' as any),
            details: {
                code: payload.ruleCode,
                violations: payload.restrictionDetails,
                alert: 'Se detectó una asignación que excede los límites contractuales o normativas de fatiga.',
            },
        });
    }
}