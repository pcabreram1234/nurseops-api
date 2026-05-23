import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';

@Injectable()
export class WebhookReplayService {
    private readonly logger = new Logger(WebhookReplayService.name);

    constructor(private readonly prisma: PrismaService) { }

    async replayExecution(logId: string): Promise<any> {
        this.logger.log(`[REPLAY]: Forcing manual re-execution of the webhook: ${logId}`);
        const log = await this.prisma.webhookLog.findUnique({ where: { id: logId } });
        if (!log) throw new Error('Webhook record not found in database.');

        return { success: true, replayedPayload: log.payload };
    }
}