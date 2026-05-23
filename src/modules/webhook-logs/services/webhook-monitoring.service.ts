import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WebhookMonitoringService {
    private readonly logger = new Logger(WebhookMonitoringService.name);

    logLatency(logId: string, durationMs: number): void {
        this.logger.log(`[TELEMETRÍA]: Webhook ${logId} processed en ${durationMs}ms.`);
    }
}