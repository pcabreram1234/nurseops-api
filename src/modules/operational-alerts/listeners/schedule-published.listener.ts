import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ALERT_SYSTEM_LISTENERS } from '../constants/operational-alerts.constants';

@Injectable()
export class SchedulePublishedListener {
    private readonly logger = new Logger(SchedulePublishedListener.name);

    @OnEvent(ALERT_SYSTEM_LISTENERS.SCHEDULE_PUBLISHED)
    handleSchedulePublished(payload: any) {
        this.logger.log(`[LISTENER]: Analyzing published quadrant to rule out early coverage alerts.`);
    }
}