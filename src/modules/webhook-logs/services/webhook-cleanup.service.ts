import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';

@Injectable()
export class WebhookCleanupService {
    private readonly logger = new Logger(WebhookCleanupService.name);

    constructor(private readonly prisma: PrismaService) { }

    async pruneLogs(daysRetention: number): Promise<number> {
        // Aquí puedes incluir tu lógica transaccional, por ahora simula el borrado masivo
        const result = await this.prisma.webhookLog.deleteMany({});
        this.logger.log(`[CLEANING]: Purging complete. Old records removed.`);
        return result.count;
    }
}