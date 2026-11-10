import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateShiftChangeApprovalDto } from '../dto/create-shift-change-approval.dto';
import { ShiftChangeApprovalFilterDto } from '../dto/shift-change-approval-filter.dto';
import { ApprovalFlowService } from './approval-flow.service';
import { ApprovalAiService } from './approval-ai.service';
import { ApprovalNotificationService } from './approval-notification.service';
import { APPROVALS_EXPIRATION_HOURS, APPROVAL_EVENTS } from '../constants/shift-change-approvals.constants';
import { ApprovalCreatedEvent } from '../events/approval-created.event';

export interface UserOrgContext {
  organizationId?: string;
  departmentId?: string;
  role?: string;
  id?: string;
  sub?: string;
}

/**
 * Resuelve el departmentId del usuario a partir del JWT.
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
 * Verifica si el usuario puede crear una solicitud de cambio de turno.
 */
function checkCreatePermission(userOrg?: UserOrgContext): void {
  if (!userOrg) {
    throw new ForbiddenException('Contexto de usuario no disponible.');
  }

  const allowedRoles = ['SUPER', 'SYSTEM_ADMIN', 'NIGHT_SUPERVISOR', 'SUPERVISOR'];
  if (!allowedRoles.includes(userOrg.role!)) {
    throw new ForbiddenException('Su rol no tiene permiso para solicitar cambios de turno');
  }
}

@Injectable()
export class ShiftChangeApprovalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly flowService: ApprovalFlowService,
    private readonly aiService: ApprovalAiService,
    private readonly notificationService: ApprovalNotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private buildWhere(filters: ShiftChangeApprovalFilterDto, userOrg?: UserOrgContext) {
    const where: any = {
      ...(filters.status && { status: filters.status }),
      ...(filters.requestingNurseId && { requestingNurseId: filters.requestingNurseId }),
    };

    // Aislamiento organizacional
    if (userOrg && userOrg.role !== 'SUPER') {
      if (userOrg.organizationId) {
        where.organizationId = userOrg.organizationId;
      }
      
      // JUNIOR_NURSE / SENIOR_NURSE: solo sus propios registros
      if (['JUNIOR_NURSE', 'SENIOR_NURSE'].includes(userOrg.role!)) {
        const userId = userOrg.id || userOrg.sub;
        if (userId) {
          where.requestingNurseId = userId;
        }
      }
    }

    return where;
  }

  async create(dto: CreateShiftChangeApprovalDto, userOrg?: UserOrgContext) {
    // 1. Obtener departamento del turno para derivar nivel de flujo
    const currentShift = await this.prisma.scheduleEntry.findUnique({
      where: { id: dto.shiftEntryId },
    });
    if (!currentShift) throw new NotFoundException('El turno especificado no existe.');

    // 2. Evaluación de riesgo por IA analítica
    const aiInsight = await this.aiService.evaluateImpact(dto.requestingNurseId, dto.targetNurseId, dto.shiftEntryId);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + APPROVALS_EXPIRATION_HOURS);

    const approval = await this.prisma.shiftChangeApprovals.create({
      data: {
        organizationId: userOrg!.organizationId!,
        requesterId: dto.requestingNurseId,
        shiftChangeRequestId: dto.shiftEntryId,
        comments: dto.comments ?? '',
        expiresAt,
        aiRecommendation: aiInsight.recommendation,
      },
    });

    this.eventEmitter.emit(APPROVAL_EVENTS.CREATED, new ApprovalCreatedEvent(approval.id, userOrg!.organizationId!, dto.requestingNurseId));
    await this.notificationService.notifyCreated(approval);

    return approval;
  }

  async findAll(filters: ShiftChangeApprovalFilterDto, userOrg?: UserOrgContext) {
    const where = this.buildWhere(filters, userOrg);

    return this.prisma.shiftChangeApprovals.findMany({
      where,
      include: {
        shiftChangeRequest: true,
        requestingNurse: { include: { user: true } },
        targetNurse: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userOrg?: UserOrgContext) {
    const where: any = { id };

    // Aislamiento: solo SUPER ve todos; otros filtran por su organización
    if (userOrg && userOrg.role !== 'SUPER') {
      if (userOrg.organizationId) {
        where.organizationId = userOrg.organizationId;
      }
      
      // JUNIOR_NURSE / SENIOR_NURSE: solo sus propios registros
      if (['JUNIOR_NURSE', 'SENIOR_NURSE'].includes(userOrg.role!)) {
        const userId = userOrg.id || userOrg.sub;
        if (userId) {
          where.requestingNurseId = userId;
        }
      }
    }

    const approval = await this.prisma.shiftChangeApprovals.findFirst({
      where,
      include: {
        shiftChangeRequest: true,
        requestingNurse: { include: { user: true } },
        targetNurse: { include: { user: true } },
      },
    });

    if (!approval) {
      throw new NotFoundException('Solicitud de cambio de turno no encontrada o sin permisos para acceder.');
    }

    return approval;
  }
}
