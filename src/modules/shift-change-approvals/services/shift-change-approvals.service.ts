import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateShiftChangeApprovalDto } from '../dto/create-shift-change-approval.dto';
import { ShiftChangeApprovalFilterDto } from '../dto/shift-change-approval-filter.dto';
import { ApprovalFlowService } from './approval-flow.service';
import { ApprovalAiService } from './approval-ai.service';
import { ApprovalNotificationService } from './approval-notification.service';
import { APPROVALS_EXPIRATION_HOURS, APPROVAL_EVENTS } from '../constants/shift-change-approvals.constants';
import { ApprovalCreatedEvent } from '../events/approval-created.event';

@Injectable()
export class ShiftChangeApprovalsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly flowService: ApprovalFlowService,
    private readonly aiService: ApprovalAiService,
    private readonly notificationService: ApprovalNotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateShiftChangeApprovalDto, userContext: any) {
    // 1. Obtener departamento del turno para derivar nivel de flujo
    const currentShift = await this.prisma.scheduleEntry.findUnique({
      where: { id: dto.shiftEntryId },
    });
    if (!currentShift) throw new NotFoundException('El turno especificado no existe.');

    // const requiredLevel = await this.flowService.determineRequiredLevel(currentShift.departmentId);

    // 2. Evaluación de riesgo por IA analítica
    const aiInsight = await this.aiService.evaluateImpact(dto.requestingNurseId, dto.targetNurseId, dto.shiftEntryId);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + APPROVALS_EXPIRATION_HOURS);

    const approval = await this.prisma.shiftChangeApprovals.create({
      data: {
        organizationId: userContext.organizationId,
        requesterId: dto.requestingNurseId,
        // include related request id and comments to satisfy Prisma create input
        shiftChangeRequestId: dto.shiftEntryId,
        comments: dto.comments ?? '',
        expiresAt,
        aiRecommendation: aiInsight.recommendation,
      },
    });

    this.eventEmitter.emit(APPROVAL_EVENTS.CREATED, new ApprovalCreatedEvent(approval.id, userContext.organizationId, dto.requestingNurseId));
    await this.notificationService.notifyCreated(approval);

    return approval;
  }

  async findAll(filters: ShiftChangeApprovalFilterDto, userContext: any) {
    return this.prisma.shiftChangeApprovals.findMany({
      where: {
        organizationId: userContext.organizationId,
        ...(filters.status && { status: filters.status }),
        ...(filters.requestingNurseId && { requestingNurseId: filters.requestingNurseId }),
      },
      include: {
        shiftChangeRequest: true,
        requestingNurse: { include: { user: true } },
        targetNurse: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}