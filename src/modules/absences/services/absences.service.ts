import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";
import {
  assertBranchInOrganization,
  resolveNurseBranch,
} from "@common/utils/branch-scope";

@Injectable()
export class AbsencesService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveBranch(dto: any, organizationId: string) {
    if (dto.branchId) {
      await assertBranchInOrganization(
        this.prisma,
        dto.branchId,
        organizationId,
      );
      return dto.branchId as string;
    }

    if (dto.nurseId) {
      return resolveNurseBranch(this.prisma, dto.nurseId, organizationId);
    }

    return null;
  }

  async create(dto: any, user: any) {
    const { date, endDate, nurseId, reporterById, branchId: requestedBranchId, ...rest } = dto;
    const branchId = await this.resolveBranch(
      { nurseId, branchId: requestedBranchId },
      user.organizationId,
    );

    return this.prisma.absence.create({
      data: {
        ...rest,
        // Prisma DateTime requiere ISO completo; las fechas llegan como "YYYY-MM-DD"
        date: new Date(date).toISOString(),
        ...(endDate ? { endDate: new Date(endDate).toISOString() } : {}),
        nurse: { connect: { id: nurseId } },
        reporter: { connect: { id: reporterById } },
        organization: { connect: { id: user.organizationId } },
        ...(branchId ? { branch: { connect: { id: branchId } } } : {}),
      },
      include: {
        nurse: { include: { user: true, branch: true } },
        reporter: true,
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
        nurse: { departmentId: query.departmentId },
      }),
      ...(query.type && {
        type: query.type,
      }),
      ...(query.status && {
        status: query.status,
      }),
      ...(query.startDate &&
        query.endDate && {
          date: {
            gte: new Date(query.startDate),
            lte: new Date(query.endDate),
          },
        }),
    };

    const include = {
      nurse: { include: { user: true, department: true, branch: true } },
      reporter: true,
      approvedBy: true,
      branch: true,
    };

    const orderBy = { date: "desc" as const };

    // Paginación opcional
    if (query.page || query.limit) {
      const page = Math.max(1, Number(query.page) || 1);
      const limit = Math.min(500, Math.max(1, Number(query.limit) || 25));
      const [data, total] = await Promise.all([
        this.prisma.absence.findMany({
          where,
          include,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.absence.count({ where }),
      ]);
      return {
        data,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    }

    return this.prisma.absence.findMany({
      where,
      include,
      orderBy,
    });
  }

  async findOne(id: string, user: any) {
    const absence = await this.prisma.absence.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        nurse: { include: { user: true, department: true, branch: true } },
        reporter: true,
        branch: true,
      },
    });

    if (!absence) {
      throw new NotFoundException("Absence not found");
    }

    return absence;
  }

  async update(id: string, dto: any, user: any) {
    const current = await this.findOne(id, user);

    const { date, endDate, nurseId, reporterById, branchId: requestedBranchId, ...rest } = dto;

    const branchId = await this.resolveBranch(
      { nurseId, branchId: requestedBranchId },
      user.organizationId,
    );

    return this.prisma.absence.update({
      where: {
        id,
      },
      data: {
        ...rest,
        ...(nurseId ? { nurseId } : {}),
        ...(reporterById ? { reporterById } : {}),
        ...(date ? { date: new Date(date).toISOString() } : {}),
        ...(endDate !== undefined
          ? {
              endDate: endDate
                ? new Date(endDate).toISOString()
                : new Date(date || current.date).toISOString(),
            }
          : {}),
        ...(branchId ? { branchId } : {}),
      },
      include: { branch: true },
    });
  }
}
