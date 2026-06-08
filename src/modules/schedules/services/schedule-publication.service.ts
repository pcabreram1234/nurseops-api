// 📄 schedule-publication.service.ts
import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "@infra/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { ScheduleStatus, ActivityLogType } from "@prisma/client";
import { ScheduleValidationService } from "./schedule-validation.service";
import { ScheduleVersionService } from "./schedule-version.service";
import { PublishScheduleDto } from "../dto/publish-schedule.dto";

@Injectable()
export class SchedulePublicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validationService: ScheduleValidationService,
    private readonly versionService: ScheduleVersionService,
    private readonly eventEmitter: EventEmitter2,
    @InjectQueue("notifications")
    private readonly notificationsQueue: Queue,
  ) {}

  async publish(id: string, dto: PublishScheduleDto, user: any) {
    // 1. Verificación previa de existencia del horario maestro
    const scheduleExists = await this.prisma.schedule.findUnique({
      where: { id },
      include: {
        scheduleEntries: {
          select: {
            nurseId: true,
          },
        },
      },
    });

    if (!scheduleExists) {
      throw new NotFoundException(`No schedule with ID was found: ${id}`);
    }

    if (scheduleExists.status === ScheduleStatus.PUBLISHED && !dto.forcePublish) {
      throw new BadRequestException("This schedule has already been published.");
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE & SNAPSHOT (Antes de alterar la DB principal)
    |--------------------------------------------------------------------------
    */
    if (dto.validateBeforePublish) {
      await this.validationService.validateSchedule(id);
    }

    if (dto.createVersionSnapshot) {
      await this.versionService.createSnapshot(id);
    }

    /*
    |--------------------------------------------------------------------------
    | TRANSACTION EXECUTION (Operación atómica en bloque)
    |--------------------------------------------------------------------------
    */
    const publishedSchedule = await this.prisma.$transaction(async (tx) => {
      
      // A. Actualizar el estado maestro del Cronograma (Schedule)
      const updatedSchedule = await tx.schedule.update({
        where: { id },
        data: {
          status: ScheduleStatus.PUBLISHED,
          publishedAt: new Date(),
          publishedById: user.id || user.sub, // Tolera sub de JWT o id directo
        },
      });

      // B. Inyección automática en la tabla histórica de auditoría (ActivityLog)
      // Usamos el enum ActivityLogType definido en tu schema.prisma
      await tx.activityLog.create({
        data: {
          userId: user.id || user.sub,
          action: ActivityLogType.SCHEDULE_PUBLISHED, // Mapeado desde tus enums de prisma
          details: {
            message: `Schedule for the period successfully published by the administrator.`,
            scheduleId: id,
            totalEntriesAffected: scheduleExists.scheduleEntries.length,
            publicationNotes: dto.publicationNotes || "No comments.",
            forced: !!dto.forcePublish,
          },
        },
      });

      return updatedSchedule;
    });

    /*
    |--------------------------------------------------------------------------
    | ASYNC QUEUES & BACKGROUND NOTIFICATIONS (Fuera de la transacción)
    |--------------------------------------------------------------------------
    */
    if (dto.notifyStaff) {
      // Extraemos los IDs únicos del personal de enfermería asignado en este bloque
      const nurseIds = Array.from(
        new Set(
          scheduleExists.scheduleEntries
            .map((e) => e.nurseId)
            .filter((nurseId): nurseId is string => !!nurseId)
        )
      );

      if (nurseIds.length > 0) {
        // Añadimos el trabajo a la cola de BullMQ con parámetros avanzados del DTO
        await this.notificationsQueue.add(
          "schedule-published",
          {
            scheduleId: id,
            nurseIds, // Enviamos el listado de afectados para que el worker procese en paralelo
            channels: {
              email: dto.sendEmails ?? true,
              push: dto.sendPushNotifications ?? true,
            },
            notes: dto.publicationNotes || "",
          },
          {
            attempts: 3, // Reintentos automáticos si falla el servidor de correo/push
            backoff: 5000, // Esperar 5 segundos entre reintentos
          }
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | INTERNAL APP EVENTS
    |--------------------------------------------------------------------------
    */
    this.eventEmitter.emit("schedule.published", {
      scheduleId: id,
      publishedBy: user.id || user.sub,
      timestamp: new Date(),
    });

    return publishedSchedule;
  }
}