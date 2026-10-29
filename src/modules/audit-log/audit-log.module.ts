import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { PrismaModule } from "@infra/database/prisma.module";
import { AuditLogController } from "./controllers/audit-log.controller";
import { AuditLogService } from "./services/audit-log.service";
import { AuditProcessor } from "./processors/audit.processor";
import { AuditCreatedListener } from "./listeners/audit-created.listener";
import { AuditSanitizerService } from "./services/audit-sanitizer.service";

/**
 * Módulo de Auditoría (AuditLog).
 *
 * 1. Expone el endpoint REST de SOLO LECTURA (`GET /api/v1/audit-logs`).
 * 2. Registra el pipeline de persistencia que estaba huérfano:
 *    evento `audit.created` → AuditCreatedListener → cola BullMQ "audit" → AuditProcessor → tabla AuditLog.
 */
@Module({
  imports: [
    PrismaModule,
    EventEmitterModule.forRoot(),
    BullModule.registerQueue({ name: "audit" }),
  ],
  controllers: [AuditLogController],
  providers: [
    AuditLogService,
    AuditProcessor,
    AuditCreatedListener,
    AuditSanitizerService,
  ],
  exports: [AuditLogService],
})
export class AuditLogModule {}
