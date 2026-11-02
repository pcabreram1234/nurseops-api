import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "@infra/database/prisma.service";
import { DocumentStorageService } from "../services/document-storage.service";

/**
 * Job de retención documental: marca y elimina físicamente los documentos
 * GENERADOS cuya fecha de retención expiró, conforme a la política configurada
 * en la plantilla (retentionDays). La auditoría y los metadatos se conservan.
 */
@Injectable()
export class DocumentRetentionJob {
  private readonly logger = new Logger(DocumentRetentionJob.name);
  private isRunning = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: DocumentStorageService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCron() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      const expired = await this.prisma.generatedDocument.findMany({
        where: {
          retentionUntil: { not: null, lt: new Date() },
          status: "GENERATED",
        },
      });

      let processed = 0;
      for (const document of expired) {
        await this.storage.delete(document.filePath);
        await this.prisma.generatedDocument.update({
          where: { id: document.id },
          data: {
            metadata: {
              ...(document.metadata as Record<string, any>),
              retentionExpiredAt: new Date().toISOString(),
            },
          },
        });
        processed++;
      }

      this.logger.log(`Retención documental: ${processed} documentos purgados (metadatos conservados).`);
    } catch (error: any) {
      this.logger.error(`Error en retención documental: ${error?.message}`, error?.stack);
    } finally {
      this.isRunning = false;
    }
  }
}
