import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

import { VacationStatus } from "@prisma/client";
import {
  assertBranchInOrganization,
  resolveNurseBranch,
} from "@common/utils/branch-scope";

@Injectable()
export class VacationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any, user: any) {
    /*
    |--------------------------------------------------------------------------
    | VALIDATE DATES
    |--------------------------------------------------------------------------
    */

    if (new Date(dto.endDate) < new Date(dto.startDate)) {
      throw new BadRequestException("End date cannot be before start date");
    }

    // El modelo Prisma usa start_Date / end_Date y departmentId es obligatorio.
    const { startDate, endDate, notes, reason, nurseId, branchId: requestedBranchId, ...rest } = dto;

    const nurse = await this.prisma.nurse.findUnique({
      where: { id: nurseId },
      select: { departmentId: true },
    });

    if (!nurse) {
      throw new BadRequestException("The selected nurse does not exist.");
    }

    let branchId = requestedBranchId;
    if (branchId) {
      await assertBranchInOrganization(
        this.prisma,
        branchId,
        user.organizationId,
      );
    } else {
      branchId = await resolveNurseBranch(
        this.prisma,
        nurseId,
        user.organizationId,
      );
    }

    return this.prisma.vacation.create({
      data: {
        ...rest,
        reason: reason ?? "",
        notes: notes ?? "",
        start_Date: new Date(startDate).toISOString(),
        end_Date: new Date(endDate).toISOString(),
        status: dto.status || VacationStatus.DRAFT,
        department: { connect: { id: nurse.departmentId } },
        nurse: { connect: { id: nurseId } },
        organization: { connect: { id: user.organizationId } },
        ...(branchId ? { branch: { connect: { id: branchId } } } : {}),
      },
      include: {
        nurse: { include: { user: true, branch: true } },
        department: true,
        branch: true,
      },
    });
  }

  async findAll(query: any, user: any) {
    const where = {
      organizationId: user.organizationId,

      ...(query.nurseId && {
        nurseId: query.nurseId,
      }),

      ...(query.branchId && {
        branchId: query.branchId,
      }),

      ...(query.departmentId && {
        departmentId: query.departmentId,
      }),

      ...(query.status && {
        status: query.status,
      }),
      // El modelo Prisma usa start_Date / end_Date
      ...(query.startDate && {
        start_Date: { gte: new Date(query.startDate) },
      }),
      ...(query.endDate && {
        end_Date: { lte: new Date(query.endDate) },
      }),
    };

    const include = {
      nurse: { include: { user: true, branch: true } },
      department: true,
      approvedBy: true,
      branch: true,
    };

    const orderBy = { createdAt: "desc" as const };

    // Paginación opcional
    if (query.page || query.limit) {
      const page = Math.max(1, Number(query.page) || 1);
      const limit = Math.min(500, Math.max(1, Number(query.limit) || 25));
      const [data, total] = await Promise.all([
        this.prisma.vacation.findMany({
          where,
          include,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.vacation.count({ where }),
      ]);
      return {
        data,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    }

    return this.prisma.vacation.findMany({
      where,
      include,
      orderBy,
    });
  }

  async findOne(id: string, user: any) {
    const vacation = await this.prisma.vacation.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        nurse: true,
        approvedBy: true,
        department: true,
        branch: true,
      },
    });

    if (!vacation) {
      throw new NotFoundException("Vacation not found");
    }

    return vacation;
  }

  async update(id: string, dto: any, user: any) {
    await this.findOne(id, user);

    // Mapeo de campos del DTO (startDate/endDate) a los del modelo (start_Date/end_Date)
    const { startDate, endDate, ...rest } = dto;

    let departmentId: string | undefined;
    if (dto.nurseId) {
      const nurse = await this.prisma.nurse.findUnique({
        where: { id: dto.nurseId },
        select: { departmentId: true },
      });
      if (!nurse) {
        throw new BadRequestException("The selected nurse does not exist.");
      }
      departmentId = nurse.departmentId;
    }

    if (dto.branchId) {
      await assertBranchInOrganization(
        this.prisma,
        dto.branchId,
        user.organizationId,
      );
    } else if (dto.nurseId) {
      rest.branchId = await resolveNurseBranch(
        this.prisma,
        dto.nurseId,
        user.organizationId,
      );
    }

    return this.prisma.vacation.update({
      where: {
        id,
      },

      data: {
        ...rest,
        ...(departmentId ? { departmentId } : {}),
        ...(startDate ? { start_Date: new Date(startDate).toISOString() } : {}),
        ...(endDate ? { end_Date: new Date(endDate).toISOString() } : {}),
      },
      include: {
        nurse: { include: { user: true, branch: true } },
        department: true,
        branch: true,
      },
    });
  }

  async approve(id: string, dto: any, user: any) {
    await this.findOne(id, user);
    return this.prisma.vacation.update({
      where: {
        id,
      },

      data: {
        status: dto.status,

        approvedById: user.sub,

        approvedAt: new Date(),

        rejectionReason: dto.rejectionReason,
      },
    });
  }

  async remove(id: string, user: any) {
    await this.findOne(id, user);
    return this.prisma.vacation.delete({
      where: {
        id,
      },
    });
  }
}
