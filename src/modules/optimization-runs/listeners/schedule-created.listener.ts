import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SYSTEM_LISTENERS } from '../constants/optimization-runs.constants';

@Injectable()
export class ScheduleCreatedListener {
    private readonly logger = new Logger(ScheduleCreatedListener.name);

    @OnEvent(SYSTEM_LISTENERS.SCHEDULE_CREATED)
    handleScheduleCreated(payload: { scheduleId: string }) {
        this.logger.log(`[AUTOMACIÓN]: New base role ${payload.scheduleId} detected. Enqueuing structural pre-validation..`);
    }
}