// 📄 schedule-publication.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "@infra/database/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { ScheduleStatus, ActivityLogType } from "@prisma/client";
import { ScheduleValidationService } from "./schedule-validation.service";
import { ScheduleVersionService } from "./schedule-version.service";
import { PublishScheduleDto } from "../dto/publish-schedule.dto";

export interface UserOrgContext {
  organizationId?: string;
  departmentId?: string;
  role?: string;
  id?: string;
  sub?: string;
}

/**
 * Resuelve el departmentId del usuario a partir del JWT.
 * Si ya viene en userOrg.departmentId, se usa directamente.
 * Si no, se busca la enfermera asociada al user.id o user.sub.
 */
async function resolveUserDepartmentId(prisma: PrismaService, userOrg: UserOrgContext): Promise<string | undefined> {
  if (userOrg.departmentId) {
    return userOrg.departmentId;
  }
  const userId = userOrg.id || userOrg.sub;
  if (!userId) return undefined;

  const nurse = await prisma.nurse.findFirst({
    where: { userId },
    select: { departmentId: true },
  });
  return nurse?.departmentId;
}

/**
 * Verifica si el usuario tiene permiso para publicar el horario del departamento indicado.
 * - SUPER: sin restricciones.
 * - HR_MANAGER / SYSTEM_ADMIN: cualquier departamento de su organización.
 * - HEAD_DEPARTMENT / SUPERVISOR: solo su propio departamento.
 */
function checkPublishPermission(scheduleDeptId: string, scheduleOrgId: string | undefined, userOrg: UserOrgContext): void {
  if (!userOrg) {
    throw new ForbiddenException("Contexto de usuario no disponible.");
  }

  if (userOrg.role === "SUPER") return; // Sin restricciones

  if (scheduleOrgId && userOrg.organizationId && scheduleOrgId !== userOrg.organizationId) {
    throw new ForbiddenException("El horario no pertenece a su organización.");
  }

  if (["HR_MANAGER", "SYSTEM_ADMIN"].includes(userOrg.role!)) {
    return; // Puede publicar cualquier departamento de su organización
  }

  if (["HEAD_DEPARTMENT", "NIGHT_SUPERVISOR", "SUPERVISOR"].includes(userOrg.role!)) {
    if (!userOrg.departmentId || scheduleDeptId !== userOrg.departmentId) {
      throw new ForbiddenException("Solo puede publicar horarios de su propio departamento.");
    }
    return;
  }

  throw new ForbiddenException("Su rol no tiene permiso para publicar horarios.");
}

@Injectable()
export class SchedulePublicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validationService: ScheduleValidationService,
    private readonly versionService: ScheduleVersionService,
    private readonly eventEmitter: EventEmitter2,
    @InjectQueue("notifications")
    private readonly notificationsQueue: Queue,
  ) { }

  async publish(id: string, dto: PublishScheduleDto, userOrg?: UserOrgContext) {
    console.log(dto)
    // 1. Verificación previa de existencia del horario maestro
    const scheduleExists = await this.prisma.schedule.findUnique({
      where: { id },
      include: {
        scheduleEntries: {
          select: {
            nurseId: true,
          },
        },
        department: {
          select: {
            id: true,
            organizationId: true,
          },
        },
      },
    });

    if (!scheduleExists) {
      throw new NotFoundException(`No schedule with ID was found: ${id}`);
    }

    // 2. Resolver departmentId del usuario si no viene en el contexto
    const userDeptId = await resolveUserDepartmentId(this.prisma, userOrg ?? {});

    // 3. Verificar permisos según rol
    checkPublishPermission(
      scheduleExists.department.id,
      scheduleExists.department.organizationId,
      {
        ...userOrg,
        departmentId: userDeptId || userOrg?.departmentId,
      }
    );

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
          publishedById: userOrg!.id || userOrg!.sub!, // Tolera sub de JWT o id directo
        },
      });

      // B. Inyección automática en la tabla histórica de auditoría (ActivityLog)
      await tx.activityLog.create({
        data: {
          userId: userOrg!.id || userOrg!.sub!,
          action: ActivityLogType.SCHEDULE_PUBLISHED,
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
      const nurseIds = Array.from(
        new Set(
          scheduleExists.scheduleEntries
            .map((e) => e.nurseId)
            .filter((nurseId): nurseId is string => !!nurseId)
        )
      );

      if (nurseIds.length > 0) {
        await this.notificationsQueue.add(
          "schedule-published",
          {
            scheduleId: id,
            nurseIds,
            channels: {
              email: dto.sendEmails ?? true,
              push: dto.sendPushNotifications?.publish ?? true,
            },
            notes: dto.publicationNotes || "",
          },
          {
            attempts: 3,
            backoff: 5000,
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
      organizationId: scheduleExists.department.organizationId,
      publishedById: userOrg?.id || userOrg?.sub,
      publishedAt: new Date(),
      notifyStaff: dto.notifyStaff ?? false,
    });

    return publishedSchedule;
  }
}
