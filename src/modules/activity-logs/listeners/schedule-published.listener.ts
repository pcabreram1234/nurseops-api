import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SYSTEM_INTEGRATION_EVENTS } from '../constants/activity-logs.constants';
import { ActivityLogsService } from '../services/activity-logs.service';

@Injectable()
export class SchedulePublishedListener {
    constructor(private readonly logsService: ActivityLogsService) { }

    @OnEvent(SYSTEM_INTEGRATION_EVENTS.SCHEDULE_PUBLISHED)
    async handleSchedulePublished(payload: { scheduleId: string; publishedById: string }) {
        await this.logsService.create({
            userId: payload.publishedById,
            action: 'SCHEDULE_PUBLISHED' as any,
            details: {
                scheduleId: payload.scheduleId,
                timestamp: new Date(),
            },
        });
    }
}