import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WORKLOAD_SYSTEM_LISTENERS } from '../constants/workload-metrics.constants';

@Injectable()
export class SchedulePublishedListener {
    private readonly logger = new Logger(SchedulePublishedListener.name);

    @OnEvent(WORKLOAD_SYSTEM_LISTENERS.SCHEDULE_PUBLISHED)
    handleSchedulePublished(payload: { scheduleId: string; organizationId: string }) {
        this.logger.log(`[KPI]: New role posted in organization ${payload.organizationId}. Planning a preventive audit of work fatigue.`);
    }
}