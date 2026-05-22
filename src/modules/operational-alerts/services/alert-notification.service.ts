import { Injectable, Logger } from '@nestjs/common';
import { AlertChannel } from '../enums/alert-channel.enum';

@Injectable()
export class AlertNotificationService {
    private readonly logger = new Logger(AlertNotificationService.name);

    async dispatch(alertId: string, targetRole: string, channel: AlertChannel, body: string): Promise<void> {
        this.logger.log(`[NOTIFICATION] Dispatching via [${channel}] to the role ${targetRole}. Alert: ${alertId}. Message: ${body}`);
    }
}