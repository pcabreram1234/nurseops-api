import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "@infra/database/prisma.service";
import { ShiftChangeValidatorService } from "./shift-change-validator.service";
import { ShiftChangeRiskService } from "./shift-change-risk.service";
import { ShiftChangeAIService } from "./shift-change-ai.service";
import { ShiftChangeAuditService } from "./shift-change-audit.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  ShiftChangeOperationType,
  RequestStatus,
  ChangeApprovalsTypes,
  ApplicationStatus,
  ScheduleEntryStatus,
  ActionAuditLogTypes,
} from "@prisma/client";
import { NotificationChannel } from "@modules/notifications/dto/send-notification.dto";
import { NotificationsService } from "@modules/notifications/services/notifications.service";

/**
 * Roles que pueden crear solicitudes en nombre de otra enfermera (privilegiados).
 */
const PRIVILEGED_ROLES = ["SUPER", "ADMIN", "SUPERVISOR"];

/**
 * Roles que pueden aprobar/rechazar solicitudes.
 */
const APPROVER_ROLES = ["SUPER", "ADMIN", "SUPERVISOR"];

@Injectable()
export class ShiftChangeRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shiftChangeValidatorService: ShiftChangeValidatorService,
    private readonly shiftChangeRiskService: ShiftChangeRiskService,
    private readonly shiftChangeAIService: ShiftChangeAIService,
    private readonly shiftChangeAuditService: ShiftChangeAuditService,
    private readonly notificationsService: NotificationsService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  /**
   * Verifica si el usuario autenticado puede crear solicitudes para el requesterId dado.
   * - NURSE: solo su propio userId.
   *   SUPER/ADMIN/SUPERVISOR: cualquier enfermera de su organización.
   */
  private async canCreateOnBehalfOf(
    user: any,
    requesterId: string,
  ): Promise<{ allowed: boolean; organizationId: string }> {
    const requesterNurse = await this.prisma.nurse.findUnique({
      where: { userId: requesterId },
      select: { id: true, userId: true, organizationId: true },
    });

    if (!requesterNurse) {
      throw new NotFoundException("Enfermera solicitante no encontrada.");
    }

    // NURSE solo puede usar su propia identidad
    if (user.role === "NURSE") {
      if (requesterId !== user.sub) {
        throw new ForbiddenException(
          "Una enfermera solo puede crear solicitudes en su propio nombre.",
        );
      }
      return {
        allowed: true,
        organizationId: requesterNurse.organizationId,
      };
    }

    // Roles privilegiados: verificar organización
    if (user.role === "SUPER") {
      // SUPER puede crear para cualquier organización
      return {
        allowed: true,
        organizationId: requesterNurse.organizationId,
      };
    }

    // ADMIN y SUPERVISOR: solo su propia organización
    if (!user.organizationId) {
      throw new ForbiddenException("Usuario sin organización asignada.");
    }

    if (requesterNurse.organizationId !== user.organizationId) {
      throw new ForbiddenException(
        "La enfermera solicitante no pertenece a su organización.",
      );
    }

    return {
      allowed: true,
      organizationId: user.organizationId,
    };
  }

  /**
   * Verifica si el usuario puede gestionar (aprobar/rechazar/cancelar) una solicitud.
   */
  async canManageRequest(user: any, request: any): Promise<void> {
    // SUPER puede gestionar cualquier solicitud
    if (user.role === "SUPER") {
      return;
    }

    // Debe pertenecer a la misma organización
    if (request.organizationId !== user.organizationId) {
      throw new ForbiddenException(
        "La solicitud no pertenece a su organización.",
      );
    }

    // NURSE solo puede cancelar sus propias solicitudes pendientes
    if (user.role === "NURSE") {
      if (request.requesterId !== user.sub) {
        throw new ForbiddenException(
          "Una enfermera solo puede gestionar sus propias solicitudes.",
        );
      }
      return;
    }

    // ADMIN y SUPERVISOR pueden gestionar solicitudes de su organización
    return;
  }

  /**
   * Crea una nueva solicitud de cambio de turno.
   * Valida la operación antes de crear y establece el estado inicial.
   */
  async create(dto: any, user: any) {
    const {
      requesterId,
      receiverId,
      sourceScheduleEntryId,
      targetScheduleEntryId,
      operationType = ShiftChangeOperationType.SWAP,
      reason,
      expiresAt,
      ...rest
    } = dto;

    // Validar permisos para crear en nombre del requester
    const { organizationId } = await this.canCreateOnBehalfOf(
      user,
      requesterId,
    );

    // Ejecutar validación operacional completa
    const validation = await this.shiftChangeValidatorService.validate({
      requesterId,
      receiverId,
      sourceScheduleEntryId,
      targetScheduleEntryId,
      operationType,
      organizationId,
    });

    if (!validation.canProceed) {
      throw new BadRequestException({
        message: "La operación no cumple con las reglas operacionales.",
        hardBlocks: validation.hardBlocks,
        softWarnings: validation.softWarnings,
        coverageBefore: validation.coverageBefore,
        coverageAfter: validation.coverageAfter,
      });
    }

    // Calcular fecha de expiración
    const expiresAtDate = expiresAt
      ? new Date(expiresAt)
      : new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 horas por defecto

    // Determinar estado inicial
    let initialStatus: RequestStatus;
    if (operationType === ShiftChangeOperationType.COVERAGE) {
      initialStatus = RequestStatus.PUBLISHED;
    } else if (receiverId) {
      initialStatus = RequestStatus.AWAITING_OTHER_NURSE;
    } else {
      initialStatus = RequestStatus.PUBLISHED;
    }

    // Obtener los shift IDs de las schedule entries para mantener compatibilidad
    const sourceEntry = await this.prisma.scheduleEntry.findUnique({
      where: { id: sourceScheduleEntryId },
      select: { shiftId: true, nurseId: true },
    });

    const targetEntry = targetScheduleEntryId
      ? await this.prisma.scheduleEntry.findUnique({
          where: { id: targetScheduleEntryId },
          select: { shiftId: true, nurseId: true },
        })
      : null;

    const request = await this.prisma.shiftChangeRequest.create({
      data: {
        operationType,
        status: initialStatus,
        organizationId,
        requester: { connect: { id: requesterId } },
        ...(receiverId && { receiver: { connect: { id: receiverId } } }),
        sourceScheduleEntry: { connect: { id: sourceScheduleEntryId } },
        ...(targetScheduleEntryId && {
          targetScheduleEntry: { connect: { id: targetScheduleEntryId } },
        }),
        sourceShift: { connect: { id: sourceEntry?.shiftId } },
        ...(targetEntry && { targetShift: { connect: { id: targetEntry.shiftId } } }),
        reason,
        expiresAt: expiresAtDate,
        ...rest,
      },
      include: {
        requester: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        receiver: {
          select: { id: true, firstName: true, lastName: true },
        },
        sourceScheduleEntry: {
          include: {
            shift: true,
            shiftTemplate: true,
            nurse: { include: { user: true } },
          },
        },
        targetScheduleEntry: {
          include: {
            shift: true,
            shiftTemplate: true,
            nurse: { include: { user: true } },
          },
        },
      },
    });

    // Crear respuesta pendiente para el receiver si existe
    if (receiverId) {
      await this.prisma.shiftChangeResponse.create({
        data: {
          shiftChangeRequestId: request.id,
          nurseId: receiverId,
          decision: ChangeApprovalsTypes.PENDING,
        },
      });
    }

    // Calcular riesgo y recomendación IA
    const riskAnalysis = await this.shiftChangeRiskService.calculateRisk({
      ...request,
    });

    const aiRecommendation = await this.shiftChangeAIService.recommend({
      ...request,
    });

    await this.prisma.shiftChangeRequest.update({
      where: { id: request.id },
      data: {
        aiRiskScore: riskAnalysis.riskScore,
        aiRecommendation,
      },
    });

    // Auditoría
    await this.shiftChangeAuditService.register({
      action: "SHIFT_CHANGE_CREATED" as ActionAuditLogTypes,
      entityId: request.id,
      performedBy: user.sub,
      oldValue: null,
      newValue: {
        ...request,
        createdBy: user.sub,
        requesterId,
      },
    });

    // Notificación al receiver si existe
    if (receiverId) {
      await this.notificationsService.sendBatch(
        [receiverId],
        organizationId,
        "Nueva solicitud de cambio de turno",
        "Ha recibido una solicitud de cambio de turno.",
        [NotificationChannel.IN_APP, NotificationChannel.PUSH],
        { requestId: request.id, type: "SHIFT_CHANGE_REQUESTED" },
      );

      this.eventEmitter.emit("shift-change.created", {
        requestId: request.id,
        organizationId,
        receiverId,
        createdBy: user.sub,
      });
    }

    return {
      ...request,
      validation,
      createdBy: user.sub,
    };
  }

  /**
   * Responde a una solicitud de cambio de turno (aceptar o rechazar).
   * Solo el receiver puede responder.
   */
  async respond(
    requestId: string,
    receiverUserId: string,
    decision: ChangeApprovalsTypes,
    comments?: string,
  ) {
    const request = await this.prisma.shiftChangeRequest.findUnique({
      where: { id: requestId },
      include: {
        sourceScheduleEntry: { include: { nurse: { include: { user: true } } } },
        targetScheduleEntry: { include: { nurse: { include: { user: true } } } },
      },
    });

    if (!request) {
      throw new NotFoundException("Solicitud de cambio no encontrada.");
    }

    if (request.receiverId !== receiverUserId) {
      throw new ForbiddenException(
        "Solo el receptor puede responder a esta solicitud.",
      );
    }

    if (request.status !== RequestStatus.AWAITING_OTHER_NURSE) {
      throw new BadRequestException(
        `Esta solicitud no está en estado de respuesta (estado actual: ${request.status}).`,
      );
    }

    if (request.expiresAt && new Date() > new Date(request.expiresAt)) {
      await this.prisma.shiftChangeRequest.update({
        where: { id: requestId },
        data: { status: RequestStatus.EXPIRED },
      });
      throw new BadRequestException("La solicitud ha expirado.");
    }

    const existingResponse = await this.prisma.shiftChangeResponse.findFirst({
      where: {
        shiftChangeRequestId: requestId,
        nurseId: receiverUserId,
      },
    });

    if (existingResponse) {
      await this.prisma.shiftChangeResponse.update({
        where: { id: existingResponse.id },
        data: {
          decision,
          respondedAt: new Date(),
          comments,
        },
      });
    } else {
      await this.prisma.shiftChangeResponse.create({
        data: {
          shiftChangeRequestId: requestId,
          nurseId: receiverUserId,
          decision,
          respondedAt: new Date(),
          comments,
        },
      });
    }

    let newStatus: RequestStatus;
    let notificationTitle: string;
    let notificationMessage: string;

    if (decision === ChangeApprovalsTypes.APPROVED) {
      newStatus = RequestStatus.ACCEPTED_BY_NURSE;
      notificationTitle = "Solicitud de cambio aceptada";
      notificationMessage = "La enfermera ha aceptado su solicitud de cambio de turno.";
    } else {
      newStatus = RequestStatus.REJECTED_BY_NURSE;
      notificationTitle = "Solicitud de cambio rechazada";
      notificationMessage = "La enfermera ha rechazado su solicitud de cambio de turno.";
    }

    const updatedRequest = await this.prisma.shiftChangeRequest.update({
      where: { id: requestId },
      data: { status: newStatus },
      include: {
        requester: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        receiver: {
          select: { id: true, firstName: true, lastName: true },
        },
        sourceScheduleEntry: {
          include: { shift: true, shiftTemplate: true, nurse: { include: { user: true } } },
        },
        targetScheduleEntry: {
          include: { shift: true, shiftTemplate: true, nurse: { include: { user: true } } },
        },
      },
    });

    // Notificar al requester
    await this.notificationsService.sendBatch(
      [request.requesterId],
      request.organizationId,
      notificationTitle,
      notificationMessage,
      [NotificationChannel.IN_APP, NotificationChannel.PUSH],
      { requestId: request.id, type: "SHIFT_CHANGE_ACCEPTED" },
    );

    // Auditoría
    await this.shiftChangeAuditService.register({
      action:
        decision === ChangeApprovalsTypes.APPROVED
          ? ("UPDATE" as ActionAuditLogTypes)
          : ("REJECT" as ActionAuditLogTypes),
      entityId: requestId,
      performedBy: receiverUserId,
      oldValue: { status: request.status },
      newValue: { status: newStatus, decision, comments },
    });

    this.eventEmitter.emit("shift-change.responded", {
      requestId,
      organizationId: request.organizationId,
      decision,
    });

    return updatedRequest;
  }

  /**
   * Aplica una solicitud aprobada de forma atómica.
   * Para SWAP: actualiza ambas asignaciones.
   * Para TRANSFER: cambia el nurseId del sourceEntry.
   * Para COVERAGE: cambia el nurseId del sourceEntry al candidato seleccionado.
   */
  async apply(requestId: string, approverUserId: string, organizationId: string) {
    // Re-validar justo antes de aplicar (control de concurrencia)
    const validation =
      await this.shiftChangeValidatorService.revalidateBeforeApply(
        requestId,
        organizationId,
      );

    if (!validation.canProceed) {
      throw new BadRequestException({
        message: "La operación ya no es válida al momento de aplicar.",
        hardBlocks: validation.hardBlocks,
        softWarnings: validation.softWarnings,
      });
    }

    const request = await this.prisma.shiftChangeRequest.findUnique({
      where: { id: requestId },
      include: {
        sourceScheduleEntry: {
          include: { shift: true, shiftTemplate: true, nurse: true, schedule: true, branch: true },
        },
        targetScheduleEntry: {
          include: { shift: true, shiftTemplate: true, nurse: true, schedule: true, branch: true },
        },
        responses: true,
        applications: true,
      },
    });

    if (!request) {
      throw new NotFoundException("Solicitud de cambio no encontrada.");
    }

    if (request.organizationId !== organizationId) {
      throw new ForbiddenException("No pertenece a su organización.");
    }

    const applicableStatuses = [
      RequestStatus.ACCEPTED_BY_NURSE,
      RequestStatus.APPROVED_BY_SUPERVISOR,
      RequestStatus.UNDER_SUPVERSION,
    ] as RequestStatus[];

    if (!applicableStatuses.includes(request.status)) {
      throw new BadRequestException(
        `La solicitud no está en estado aplicable (estado actual: ${request.status}).`,
      );
    }

    const sourceNurseId = request.sourceScheduleEntry?.nurseId;
    const targetNurseId = request.targetScheduleEntry?.nurseId;

    // Aplicar cambios dentro de una transacción para atomicidad
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Actualizar el sourceEntry: cambiar nurse al receiver (o al seleccionado en cobertura)
      let newSourceNurseId: string | null = null;

      if (request.operationType === ShiftChangeOperationType.COVERAGE) {
        const selectedApplication = request.applications.find(
          (a) => a.status === ApplicationStatus.SELECTED,
        );
        if (!selectedApplication) {
          throw new BadRequestException(
            "No hay candidata seleccionada para esta cobertura.",
          );
        }
        const selectedNurse = await tx.nurse.findUnique({
          where: { id: selectedApplication.nurseId },
          select: { userId: true },
        });
        newSourceNurseId = selectedNurse?.userId ?? null;
      } else if (request.receiverId) {
        newSourceNurseId = request.receiverId;
      }

      const updatedSource = await tx.scheduleEntry.update({
        where: { id: request.sourceScheduleEntryId },
        data: {
          nurseId: newSourceNurseId,
          status:
            newSourceNurseId === null
              ? ScheduleEntryStatus.OPEN
              : ScheduleEntryStatus.ASSIGNED,
        },
        include: {
          nurse: { include: { user: true } },
          shift: true,
          shiftTemplate: true,
        },
      });

      // 2. Para SWAP: también actualizar el targetEntry (el requester toma el target)
      let updatedTarget: any = null;
      if (
        request.operationType === ShiftChangeOperationType.SWAP &&
        request.targetScheduleEntryId
      ) {
        updatedTarget = await tx.scheduleEntry.update({
          where: { id: request.targetScheduleEntryId },
          data: {
            nurseId: request.requesterId,
            status: ScheduleEntryStatus.ASSIGNED,
          },
          include: {
            nurse: { include: { user: true } },
            shift: true,
            shiftTemplate: true,
          },
        });
      }

      // 3. Actualizar el estado de la solicitud a COMPLETED
      const updatedRequest = await tx.shiftChangeRequest.update({
        where: { id: requestId },
        data: {
          status: RequestStatus.COMPLETED,
          approverId: approverUserId,
          approvedAt: new Date(),
        },
      });

      // 4. Marcar todas las respuestas como procesadas
      await tx.shiftChangeResponse.updateMany({
        where: { shiftChangeRequestId: requestId },
        data: {
          decision: ChangeApprovalsTypes.APPROVED,
          respondedAt: new Date(),
        },
      });

      // 5. Marcar aplicaciones no seleccionadas como rechazadas (para COVERAGE)
      if (request.operationType === ShiftChangeOperationType.COVERAGE) {
        await tx.shiftChangeApplication.updateMany({
          where: {
            shiftChangeRequestId: requestId,
            status: ApplicationStatus.PENDING,
          },
          data: {
            status: ApplicationStatus.REJECTED,
            rejectedAt: new Date(),
          },
        });
      }

      // 6. Registrar en ActivityLog para auditoría de asignaciones
      await tx.activityLog.create({
        data: {
          userId: approverUserId,
          action: ActionAuditLogTypes.ASSIGN_SHIFT,
          details: {
            requestId,
            operationType: request.operationType,
            sourceEntryId: request.sourceScheduleEntryId,
            sourcePreviousNurseId: sourceNurseId,
            sourceNewNurseId: newSourceNurseId,
            targetEntryId: request.targetScheduleEntryId,
            targetPreviousNurseId: targetNurseId,
            targetNewNurseId:
              request.operationType === ShiftChangeOperationType.SWAP
                ? request.requesterId
                : null,
          },
        },
      });

      return { updatedSource, updatedTarget, updatedRequest };
    });

    // Notificaciones después de confirmar la transacción
    const orgId = request.organizationId;
    const notifyUsers: string[] = [request.requesterId];
    if (request.receiverId) {
      notifyUsers.push(request.receiverId);
    }
    if (request.operationType === ShiftChangeOperationType.COVERAGE) {
      const nonSelected = request.applications.filter(
        (a) => a.status !== ApplicationStatus.SELECTED,
      );
      for (const app of nonSelected) {
        const appNurse = await this.prisma.nurse.findUnique({
          where: { id: app.nurseId },
          select: { userId: true },
        });
        if (appNurse?.userId) {
          notifyUsers.push(appNurse.userId);
        }
      }
    }

    await this.notificationsService.sendBatch(
      notifyUsers,
      orgId,
      "Cambio de turno aplicado",
      "Su solicitud de cambio de turno ha sido aprobada y aplicada correctamente.",
      [NotificationChannel.IN_APP, NotificationChannel.PUSH, NotificationChannel.EMAIL],
      {
        requestId,
        type: "SHIFT_CHANGE_APPROVED",
        operationType: request.operationType,
      },
    );

    this.eventEmitter.emit("shift-change.approved", {
      requestId,
      organizationId: orgId,
      approverUserId,
    });

    return result;
  }

  /**
   * Cancela una solicitud pendiente.
   * Verifica rol y organización antes de permitir la cancelación.
   */
  async cancel(requestId: string, user: any) {
    const request = await this.prisma.shiftChangeRequest.findFirst({
      where: {
        id: requestId,
        organizationId: user.organizationId,
      },
    });

    if (!request) {
      throw new NotFoundException("Solicitud de cambio no encontrada.");
    }

    const finalStatuses = [
      RequestStatus.APPROVED_BY_SUPERVISOR,
      RequestStatus.REJECTED,
      RequestStatus.CANCELLED,
      RequestStatus.EXPIRED,
      RequestStatus.COMPLETED,
      RequestStatus.ROLLED_BACK,
    ] as RequestStatus[];

    if (finalStatuses.includes(request.status)) {
      throw new BadRequestException(
        `No se puede cancelar una solicitud con estado ${request.status}.`,
      );
    }

    // SUPER puede cancelar cualquier solicitud
    if (user.role === "SUPER") {
      // permitido
    }
    // ADMIN y SUPERVISOR deben pertenecer a la organización (ya verificado por el where)
    else if (user.role === "ADMIN" || user.role === "SUPERVISOR") {
      // ya verificado por el where de organizationId
    }
    // NURSE solo puede cancelar sus propias solicitudes pendientes
    else if (user.role === "NURSE") {
      if (request.requesterId !== user.sub) {
        throw new ForbiddenException(
          "Una enfermera solo puede cancelar sus propias solicitudes pendientes.",
        );
      }
    } else {
      throw new ForbiddenException("Rol no autorizado para cancelar.");
    }

    const cancelled = await this.prisma.shiftChangeRequest.update({
      where: { id: requestId },
      data: { status: RequestStatus.CANCELLED },
    });

    // Auditoría
    await this.shiftChangeAuditService.register({
      action: ActionAuditLogTypes.CANCEL_SHIFT,
      entityId: requestId,
      performedBy: user.sub,
      oldValue: { status: request.status },
      newValue: { status: RequestStatus.CANCELLED },
    });

    // Notificar a participantes
    const notifyUsers: string[] = [request.requesterId];
    if (request.receiverId) {
      notifyUsers.push(request.receiverId);
    }

    await this.notificationsService.sendBatch(
      notifyUsers,
      user.organizationId,
      "Solicitud de cambio cancelada",
      "Una solicitud de cambio de turno ha sido cancelada.",
      [NotificationChannel.IN_APP, NotificationChannel.PUSH],
      { requestId, type: "SHIFT_CHANGE_CANCELLED" },
    );

    this.eventEmitter.emit("shift-change.cancelled", {
      requestId,
      organizationId: user.organizationId,
    });

    return cancelled;
  }

  /**
   * Aprobar una solicitud (supervisor).
   * Verifica rol y organización antes de aprobar.
   */
  async approve(requestId: string, approverId: string, dto: any, user: any) {
    const organizationId = user.organizationId;

    const request = await this.prisma.shiftChangeRequest.findFirst({
      where: {
        id: requestId,
        organizationId,
      },
    });

    if (!request) {
      throw new NotFoundException("Solicitud de cambio no encontrada.");
    }

    // Verificar autorización de gestión
    await this.canManageRequest(user, request);

    // Verificar rol autorizado para aprobación
    if (!["SUPER", "ADMIN", "SUPERVISOR"].includes(user.role)) {
      throw new ForbiddenException("Rol no autorizado para aprobar solicitudes.");
    }

    const approvableStatuses = [
      RequestStatus.ACCEPTED_BY_NURSE,
      RequestStatus.UNDER_SUPVERSION,
      RequestStatus.AWAITING_OTHER_NURSE,
    ] as RequestStatus[];

    if (!approvableStatuses.includes(request.status)) {
      throw new BadRequestException(
        `Esta solicitud no puede ser aprobada en su estado actual (${request.status}).`,
      );
    }

    const approved = await this.prisma.shiftChangeRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.APPROVED_BY_SUPERVISOR,
        approverId,
        approvedAt: new Date(),
        supervisorNotes: dto.supervisorNotes,
      },
    });

    // Auditoría
    await this.shiftChangeAuditService.register({
      action: ActionAuditLogTypes.APPROVE,
      entityId: requestId,
      performedBy: approverId,
      oldValue: { status: request.status },
      newValue: { status: RequestStatus.APPROVED_BY_SUPERVISOR, notes: dto.supervisorNotes },
    });

    // Notificar al requester y receiver
    const notifyUsers: string[] = [request.requesterId];
    if (request.receiverId) {
      notifyUsers.push(request.receiverId);
    }

    await this.notificationsService.sendBatch(
      notifyUsers,
      organizationId,
      "Solicitud de cambio aprobada por supervisión",
      "Su solicitud de cambio de turno ha sido aprobada por supervisión y está lista para aplicarse.",
      [NotificationChannel.IN_APP, NotificationChannel.PUSH],
      { requestId, type: "SHIFT_CHANGE_APPROVED" },
    );

    return approved;
  }

  /**
   * Rechazar una solicitud (supervisor).
   * Verifica rol y organización antes de rechazar.
   */
  async reject(requestId: string, approverId: string, dto: any, user: any) {
    const organizationId = user.organizationId;

    const request = await this.prisma.shiftChangeRequest.findFirst({
      where: {
        id: requestId,
        organizationId,
      },
    });

    if (!request) {
      throw new NotFoundException("Solicitud de cambio no encontrada.");
    }

    // Verificar autorización de gestión
    await this.canManageRequest(user, request);

    // Verificar rol autorizado para rechazo
    if (!["SUPER", "ADMIN", "SUPERVISOR"].includes(user.role)) {
      throw new ForbiddenException("Rol no autorizado para rechazar solicitudes.");
    }

    const rejected = await this.prisma.shiftChangeRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.REJECTED_BY_SUPERVISOR,
        approverId,
        rejectedAt: new Date(),
        supervisorNotes: dto.reason,
      },
    });

    // Auditoría
    await this.shiftChangeAuditService.register({
      action: ActionAuditLogTypes.REJECT,
      entityId: requestId,
      performedBy: approverId,
      oldValue: { status: request.status },
      newValue: { status: RequestStatus.REJECTED_BY_SUPERVISOR, reason: dto.reason },
    });

    // Notificar al requester y receiver
    const notifyUsers: string[] = [request.requesterId];
    if (request.receiverId) {
      notifyUsers.push(request.receiverId);
    }

    await this.notificationsService.sendBatch(
      notifyUsers,
      organizationId,
      "Solicitud de cambio rechazada por supervisión",
      "Su solicitud de cambio de turno ha sido rechazada por supervisión.",
      [NotificationChannel.IN_APP, NotificationChannel.PUSH],
      { requestId, type: "SHIFT_CHANGE_REJECTED" },
    );

    return rejected;
  }

  /**
   * Actualiza una solicitud (solo si no está en estado final).
   * Verifica rol y organización.
   */
  async update(id: string, dto: any, user: any) {
    const isSuperAdmin = user.role === "SUPER";

    const request = await this.prisma.shiftChangeRequest.findFirst({
      where: isSuperAdmin
        ? { id }
        : { id, organizationId: user.organizationId },
    });

    if (!request) {
      throw new NotFoundException("Solicitud de cambio no encontrada.");
    }

    // NURSE solo puede editar sus propias solicitudes
    if (user.role === "NURSE" && request.requesterId !== user.sub) {
      throw new ForbiddenException("Una enfermera solo puede editar sus propias solicitudes.");
    }

    const finalStatuses = [
      RequestStatus.APPROVED_BY_SUPERVISOR,
      RequestStatus.REJECTED,
      RequestStatus.CANCELLED,
      RequestStatus.EXPIRED,
      RequestStatus.COMPLETED,
      RequestStatus.ROLLED_BACK,
    ] as RequestStatus[];

    if (finalStatuses.includes(request.status)) {
      throw new BadRequestException(
        `Cannot update request with status ${request.status}`,
      );
    }

    const updatedRequest = await this.prisma.shiftChangeRequest.update({
      where: { id },
      data: {
        ...dto,
      },
      include: {
        requester: {
          select: { id: true, firstName: true, lastName: true },
        },
        receiver: {
          select: { id: true, firstName: true, lastName: true },
        },
        sourceScheduleEntry: true,
        targetScheduleEntry: true,
      },
    });

    return updatedRequest;
  }

  /**
   * Lista solicitudes propias (creadas o recibidas) del usuario autenticado.
   * SUPER ve todas las de cualquier org; los demás filtran por su organización.
   */
  async findMyRequests(query: any, user: any) {
    const page = query.page || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;
    const where: any = {};

    // SUPER ve todas las solicitudes (sin filtro de organización)
    if (user.role !== "SUPER") {
      where.organizationId = user.organizationId;
    }

    if (user.role === "NURSE") {
      where.OR = [
        { requesterId: user.sub },
        { receiverId: user.sub },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.operationType) {
      where.operationType = query.operationType;
    }

    if (query.search) {
      where.OR = [
        ...(where.OR || []),
        { reason: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.shiftChangeRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          requester: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          receiver: {
            select: { id: true, firstName: true, lastName: true },
          },
          sourceScheduleEntry: {
            include: {
              shift: true,
              shiftTemplate: { include: { department: true } },
              branch: true,
              nurse: { include: { user: true } },
            },
          },
          targetScheduleEntry: {
            include: {
              shift: true,
              shiftTemplate: { include: { department: true } },
              branch: true,
              nurse: { include: { user: true } },
            },
          },
          responses: {
            include: { nurse: { select: { id: true, firstName: true, lastName: true } } },
          },
          applications: {
            include: { nurse: { select: { id: true, firstName: true, lastName: true } } },
          },
        },
      }),
      this.prisma.shiftChangeRequest.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lista solicitudes recibidas por el usuario autenticado (como receiver).
   */
  async findReceivedRequests(query: any, user: any) {
    const page = query.page || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      receiverId: user.sub,
    };

    if (user.role !== "SUPER") {
      where.organizationId = user.organizationId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.reason = { contains: query.search, mode: "insensitive" };
    }

    const [data, total] = await Promise.all([
      this.prisma.shiftChangeRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          requester: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          receiver: {
            select: { id: true, firstName: true, lastName: true },
          },
          sourceScheduleEntry: {
            include: {
              shift: true,
              shiftTemplate: { include: { department: true } },
              branch: true,
              nurse: { include: { user: true } },
            },
          },
          targetScheduleEntry: {
            include: {
              shift: true,
              shiftTemplate: { include: { department: true } },
              branch: true,
              nurse: { include: { user: true } },
            },
          },
          responses: {
            where: { nurseId: user.sub },
            include: { nurse: { select: { id: true, firstName: true, lastName: true } } },
          },
        },
      }),
      this.prisma.shiftChangeRequest.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtiene el detalle de una solicitud.
   * SUPER ve cualquier solicitud; el resto filtra por organización.
   */
  async findOne(id: string, user: any) {
    const isSuperAdmin = user.role === "SUPER";

    const request = await this.prisma.shiftChangeRequest.findFirst({
      where: isSuperAdmin
        ? { id }
        : { id, organizationId: user.organizationId },
      include: {
        requester: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        receiver: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        approver: {
          select: { id: true, firstName: true, lastName: true },
        },
        sourceScheduleEntry: {
          include: {
            shift: true,
            shiftTemplate: { include: { department: true } },
            branch: true,
            nurse: { include: { user: true } },
            schedule: true,
          },
        },
        targetScheduleEntry: {
          include: {
            shift: true,
            shiftTemplate: { include: { department: true } },
            branch: true,
            nurse: { include: { user: true } },
            schedule: true,
          },
        },
        responses: {
          include: { nurse: { select: { id: true, firstName: true, lastName: true } } },
        },
        applications: {
          include: { nurse: { select: { id: true, firstName: true, lastName: true } } },
        },
        shiftChangeApprovals: {
          include: { approver: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
    });

    if (!request) {
      throw new NotFoundException("Solicitud de cambio no encontrada.");
    }

    return request;
  }

  /**
   * Lista oportunidades de cobertura disponibles para el usuario.
   */
  async findCoverageOpportunities(query: any, user: any) {
    const page = query.page || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      operationType: ShiftChangeOperationType.COVERAGE,
      status: RequestStatus.PUBLISHED,
      expiresAt: { gt: new Date() },
    };

    if (user.role !== "SUPER") {
      where.organizationId = user.organizationId;
    }

    // Filtrar por fecha
    if (query.startDate) {
      where.sourceScheduleEntry = {
        date: { gte: new Date(query.startDate) },
      };
    }
    if (query.endDate) {
      where.sourceScheduleEntry = {
        ...(where.sourceScheduleEntry || {}),
        date: { ...(where.sourceScheduleEntry?.date || {}), lte: new Date(query.endDate) },
      };
    }

    // Filtrar por departamento
    if (query.departmentId) {
      where.sourceScheduleEntry = {
        ...(where.sourceScheduleEntry || {}),
        shiftTemplate: { departmentId: query.departmentId },
      };
    }

    // Filtrar por sede
    if (query.branchId) {
      where.sourceScheduleEntry = {
        ...(where.sourceScheduleEntry || {}),
        branchId: query.branchId,
      };
    }

    // Excluir solicitudes donde el usuario ya se postuló
    if (user.role === "NURSE") {
      const userNurse = await this.prisma.nurse.findUnique({
        where: { userId: user.sub },
        select: { id: true },
      });
      if (userNurse) {
        where.applications = {
          none: { nurseId: userNurse.id },
        };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.shiftChangeRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          requester: {
            select: { id: true, firstName: true, lastName: true },
          },
          sourceScheduleEntry: {
            include: {
              shift: true,
              shiftTemplate: { include: { department: true } },
              branch: true,
              nurse: { include: { user: true } },
            },
          },
          applications: {
            include: { nurse: { select: { id: true, firstName: true, lastName: true } } },
          },
        },
      }),
      this.prisma.shiftChangeRequest.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Se postula a una oportunidad de cobertura.
   */
  async applyToCoverage(requestId: string, nurseUserId: string) {
    const request = await this.prisma.shiftChangeRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException("Oportunidad de cobertura no encontrada.");
    }

    if (request.operationType !== ShiftChangeOperationType.COVERAGE) {
      throw new BadRequestException(
        "Esta solicitud no es una oportunidad de cobertura.",
      );
    }

    if (request.status !== RequestStatus.PUBLISHED) {
      throw new BadRequestException(
        "Esta oportunidad ya no está disponible para postulación.",
      );
    }

    if (request.expiresAt && new Date() > new Date(request.expiresAt)) {
      throw new BadRequestException("La oportunidad de cobertura ha expirado.");
    }

    const nurse = await this.prisma.nurse.findUnique({
      where: { userId: nurseUserId },
      select: { id: true, organizationId: true },
    });

    if (!nurse) {
      throw new NotFoundException("Enfermera no encontrada.");
    }

    if (nurse.organizationId !== request.organizationId) {
      throw new ForbiddenException("No pertenece a esta organización.");
    }

    // Verificar que no se haya postulado ya
    const existing = await this.prisma.shiftChangeApplication.findFirst({
      where: {
        shiftChangeRequestId: requestId,
        nurseId: nurse.id,
      },
    });

    if (existing) {
      throw new BadRequestException("Ya se ha postulado a esta oportunidad.");
    }

    // Verificar límite de múltiples postulaciones
    const policy = await this.prisma.shiftChangePolicy.findFirst({
      where: { organizationId: request.organizationId },
    });

    if (!policy?.allowMultipleApplications) {
      const existingApplications = await this.prisma.shiftChangeApplication.count({
        where: { nurseId: nurse.id, status: ApplicationStatus.PENDING },
      });
      if (existingApplications > 0) {
        throw new BadRequestException(
          "Ya tiene una postulación pendiente en otra oportunidad.",
        );
      }
    }

    const application = await this.prisma.shiftChangeApplication.create({
      data: {
        shiftChangeRequestId: requestId,
        nurseId: nurse.id,
        status: ApplicationStatus.PENDING,
      },
      include: {
        nurse: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Notificar al requester
    await this.notificationsService.sendBatch(
      [request.requesterId],
      request.organizationId,
      "Nueva postulación a su cobertura",
      "Una enfermera se ha postulado a su solicitud de cobertura de turno.",
      [NotificationChannel.IN_APP, NotificationChannel.PUSH],
      { requestId, applicationId: application.id, type: "COVERAGE_REQUEST" },
    );

    return application;
  }

  /**
   * Retira una postulación de cobertura.
   */
  async withdrawApplication(applicationId: string, nurseUserId: string) {
    const application = await this.prisma.shiftChangeApplication.findUnique({
      where: { id: applicationId },
      include: { shiftChangeRequest: true },
    });

    if (!application) {
      throw new NotFoundException("Postulación no encontrada.");
    }

    const nurse = await this.prisma.nurse.findUnique({
      where: { userId: nurseUserId },
      select: { id: true },
    });

    if (!nurse || application.nurseId !== nurse.id) {
      throw new ForbiddenException("No puede retirar esta postulación.");
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException(
        "Solo se pueden retirar postulaciones pendientes.",
      );
    }

    return this.prisma.shiftChangeApplication.update({
      where: { id: applicationId },
      data: {
        status: ApplicationStatus.WITHDRAWN,
      },
    });
  }

  /**
   * Selecciona una candidata para una cobertura.
   * Solo el requester o un supervisor puede hacerlo.
   */
  async selectCandidate(
    requestId: string,
    candidateNurseId: string,
    selectorUserId: string,
    selectorRole: string,
    organizationId: string,
  ) {
    const request = await this.prisma.shiftChangeRequest.findUnique({
      where: { id: requestId },
      include: {
        applications: { include: { nurse: { select: { id: true } } } },
      },
    }) as any;

    if (!request) {
      throw new NotFoundException("Solicitud de cobertura no encontrada.");
    }

    if (request.organizationId !== organizationId) {
      throw new ForbiddenException("No pertenece a esta organización.");
    }

    if (request.operationType !== ShiftChangeOperationType.COVERAGE) {
      throw new BadRequestException("Esta solicitud no es una cobertura.");
    }

    // Solo el requester o un supervisor/admin puede seleccionar
    const isRequester = request.requesterId === selectorUserId;
    const isSupervisorOrAdmin = ["ADMIN", "SUPERVISOR", "SUPER"].includes(selectorRole);

    if (!isRequester && !isSupervisorOrAdmin) {
      throw new ForbiddenException(
        "Solo el solicitante o un supervisor puede seleccionar una candidata.",
      );
    }

    // Verificar que la candidata existe y se ha postulado
    const application = request.applications.find(
      (a) => a.nurseId === candidateNurseId && a.status === ApplicationStatus.PENDING,
    );

    if (!application) {
      throw new NotFoundException(
        "La candidata no tiene una postulación pendiente para esta solicitud.",
      );
    }

    // Marcar todas las demás aplicaciones como rechazadas y esta como seleccionada
    return this.prisma.$transaction(async (tx) => {
      await tx.shiftChangeApplication.updateMany({
        where: {
          shiftChangeRequestId: requestId,
          id: { not: application.id },
        },
        data: {
          status: ApplicationStatus.REJECTED,
          rejectedAt: new Date(),
        },
      });

      const selected = await tx.shiftChangeApplication.update({
        where: { id: application.id },
        data: {
          status: ApplicationStatus.SELECTED,
          selectedAt: new Date(),
        },
      });

      // Notificar a la candidata seleccionada
      const candidateUserId = application.nurse.id;
      await this.notificationsService.sendBatch(
        [candidateUserId],
        organizationId,
        "Ha sido seleccionada para una cobertura",
        "Ha sido seleccionada para asumir un turno de cobertura. Confirme su aceptación.",
        [NotificationChannel.IN_APP, NotificationChannel.PUSH],
        { requestId, applicationId: application.id, type: "COVERAGE_SELECTED" },
      );

      return selected;
    });
  }

  /**
   * Genera estadísticas para tarjetas de resumen.
   */
  async getStats(user: any) {
    const baseWhere: any = {};

    if (user.role !== "SUPER") {
      baseWhere.organizationId = user.organizationId;
    }

    const myWhere = user.role === "NURSE"
      ? { ...baseWhere, OR: [{ requesterId: user.sub }, { receiverId: user.sub }] }
      : baseWhere;

    const [total, pending, approved, rejected, expired, coverage] =
      await Promise.all([
        this.prisma.shiftChangeRequest.count({ where: myWhere }),
        this.prisma.shiftChangeRequest.count({
          where: { ...myWhere, status: { in: ["AWAITING_OTHER_NURSE", "ACCEPTED_BY_NURSE", "UNDER_SUPVERSION"] as RequestStatus[] } },
        }),
        this.prisma.shiftChangeRequest.count({
          where: { ...myWhere, status: RequestStatus.APPROVED_BY_SUPERVISOR },
        }),
        this.prisma.shiftChangeRequest.count({
          where: { ...myWhere, status: { in: ["REJECTED", "REJECTED_BY_SUPERVISOR", "REJECTED_BY_NURSE"] as RequestStatus[] } },
        }),
        this.prisma.shiftChangeRequest.count({
          where: { ...myWhere, status: RequestStatus.EXPIRED },
        }),
        this.prisma.shiftChangeRequest.count({
          where: { ...baseWhere, operationType: ShiftChangeOperationType.COVERAGE, status: RequestStatus.PUBLISHED },
        }),
      ]);

    return {
      total,
      pending,
      approved,
      rejected,
      expired,
      coverageOpportunities: coverage,
    };
  }
}