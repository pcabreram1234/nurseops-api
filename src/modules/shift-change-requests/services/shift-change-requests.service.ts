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
import { ShiftChangeNotificationService } from "./shift-change-notification.service";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class ShiftChangeRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shiftChangeValidatorService: ShiftChangeValidatorService,
    private readonly shiftChangeRiskService: ShiftChangeRiskService,
    private readonly shiftChangeAIService: ShiftChangeAIService,
    private readonly shiftChangeAuditService: ShiftChangeAuditService,
    private readonly shiftChangeNotificationService: ShiftChangeNotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: any) {
    return this.prisma.shiftChangeRequest.create({
      data: dto,
    });
  }

  async findAll(query: any, user: any) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId: user.organizationId,
    };

    if (user.role === "NURSE") {
      where.OR = [
        {
          requesterId: user.sub,
        },
        {
          receiverId: user.sub,
        },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.requesterId) {
      where.requesterId = query.requesterId;
    }

    if (query.receiverId) {
      where.receiverId = query.receiverId;
    }

    if (query.search) {
      where.OR = [
        ...(where.OR || []),
        {
          reason: {
            contains: query.search,
            mode: "insensitive",
          },
        },
      ];
    }

    const allowedSortFields = ["createdAt", "updatedAt", "status"];

    const sortBy = allowedSortFields.includes(query.sortBy || "")
      ? query.sortBy
      : "createdAt";

    const [data, total] = await Promise.all([
      this.prisma.shiftChangeRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy!]: query.sortOrder || "desc",
        },

        include: {
          requester: {
            select: {
              id: true,

              firstName: true,

              lastName: true,

              email: true,
            },
          },

          receiver: {
            select: {
              id: true,

              firstName: true,

              lastName: true,
            },
          },

          sourceShift: {
            select: {
              id: true,

              startTime: true,

              endTime: true,
            },
          },

          targetShift: {
            select: {
              id: true,

              startTime: true,

              endTime: true,
            },
          },
        },
      }),

      this.prisma.shiftChangeRequest.count({
        where,
      }),
    ]);

    /*
      |--------------------------------------------------------------------------
      | RESPONSE
      |--------------------------------------------------------------------------
      */

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

  async findOne(id: string) {
    const request = await this.prisma.shiftChangeRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException("Shift change request not found");
    }

    return request;
  }

  async approve(
    id: string,

    approverId: string,

    dto: any,
  ) {
    return this.prisma.shiftChangeRequest.update({
      where: { id },

      data: {
        status: "APPROVED_BY_SUPERVISOR",

        approverId,

        approvedAt: new Date(),

        supervisorNotes: dto.supervisorNotes,
      },
    });
  }

  async reject(
    id: string,

    approverId: string,

    dto: any,
  ) {
    return this.prisma.shiftChangeRequest.update({
      where: { id },

      data: {
        status: "REJECTED",

        approverId,

        rejectedAt: new Date(),

        supervisorNotes: dto.reason,
      },
    });
  }

  async cancel(id: string) {
    return this.prisma.shiftChangeRequest.update({
      where: { id },

      data: {
        status: "CANCELLED",

        cancelledAt: new Date(),
      },
    });
  }

  async update(id: string, dto: any, user: any) {
    const request = await this.prisma.shiftChangeRequest.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
    });

    if (!request) {
      throw new NotFoundException("Shift change request not found");
    }

    const finalStatuses = ["APPROVED", "REJECTED", "CANCELLED"];

    if (finalStatuses.includes(request.status)) {
      throw new BadRequestException(
        `Cannot update request with status ${request.status}`,
      );
    }

    if (user.role === "NURSE" && request.requesterId !== user.sub) {
      throw new ForbiddenException("You cannot update this request");
    }

    /*
  |--------------------------------------------------------------------------
  | VALIDATE SHIFT CHANGES
  |--------------------------------------------------------------------------
  */

    if (dto.sourceShiftId || dto.targetShiftId) {
      await this.shiftChangeValidatorService.validate({
        ...request,
        ...dto,
      });
    }

    /*
  |--------------------------------------------------------------------------
  | CALCULATE RISK SCORE
  |--------------------------------------------------------------------------
  */

    const riskAnalysis = await this.shiftChangeRiskService.calculateRisk({
      ...request,

      ...dto,
    });

    /*
  |--------------------------------------------------------------------------
  | AI RECOMMENDATION
  |--------------------------------------------------------------------------
  */

    const aiRecommendation = await this.shiftChangeAIService.recommend({
      ...request,

      ...dto,
    });

    /*
  |--------------------------------------------------------------------------
  | UPDATE REQUEST
  |--------------------------------------------------------------------------
  */

    const updatedRequest = await this.prisma.shiftChangeRequest.update({
      where: {
        id,
      },

      data: {
        ...dto,
        aiRiskScore: riskAnalysis.riskScore,
        aiRecommendation,
      },

      include: {
        requester: {
          select: {
            id: true,

            firstName: true,

            lastName: true,
          },
        },

        receiver: {
          select: {
            id: true,

            firstName: true,

            lastName: true,
          },
        },

        sourceShift: true,

        targetShift: true,
      },
    });

    /*
  |--------------------------------------------------------------------------
  | AUDIT
  |--------------------------------------------------------------------------
  */

    await this.shiftChangeAuditService.register({
      action: "SHIFT_CHANGE_UPDATED",

      entityId: id,

      performedBy: user.sub,

      oldValue: request,

      newValue: updatedRequest,
    });

    /*
  |--------------------------------------------------------------------------
  | NOTIFICATIONS
  |--------------------------------------------------------------------------
  */

    await this.shiftChangeNotificationService.notify({
      type: "SHIFT_CHANGE_UPDATED",

      requestId: id,
    });

    /*
  |--------------------------------------------------------------------------
  | EVENTS
  |--------------------------------------------------------------------------
  */

    this.eventEmitter.emit("shift-change.updated", {
      requestId: id,

      organizationId: user.organizationId,
    });

    return updatedRequest;
  }
}
