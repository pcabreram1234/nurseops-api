import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";
import {
  assertBranchInOrganization,
  resolveNurseBranch,
} from "@common/utils/branch-scope";

@Injectable()
export class NurseAvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any, user: any) {
    /*
    |--------------------------------------------------------------------------
    | VALIDATE UNIQUE DATE
    |--------------------------------------------------------------------------
    */

    const existing = await this.prisma.nurseAvailability.findFirst({
      where: {
        nurseId: dto.nurseId,
        date: new Date(dto.date),
      },
    });

    if (existing) {
      throw new ConflictException("Availability already exists for this date");
    }

    const { date, nurseId, branchId: requestedBranchId, ...rest } = dto;

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

    return this.prisma.nurseAvailability.create({
      data: {
        ...rest,
        // Prisma DateTime requiere ISO completo; la fecha llega como "YYYY-MM-DD"
        date: new Date(date).toISOString(),
        nurse: { connect: { id: nurseId } },
        organization: { connect: { id: user.organizationId } },
        ...(branchId ? { branch: { connect: { id: branchId } } } : {}),
      },
      include: {
        nurse: { include: { user: true, branch: true } },
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
      nurse: { include: { user: true, branch: true } },
      branch: true,
    };

    const orderBy = { date: "asc" as const };

    // Paginación opcional
    if (query.page || query.limit) {
      const page = Math.max(1, Number(query.page) || 1);
      const limit = Math.min(500, Math.max(1, Number(query.limit) || 25));
      const [data, total] = await Promise.all([
        this.prisma.nurseAvailability.findMany({
          where,
          include,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.nurseAvailability.count({ where }),
      ]);
      return {
        data,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    }

    return this.prisma.nurseAvailability.findMany({
      where,
      include,
      orderBy,
    });
  }

  async findOne(id: string, user: any) {
    const availability = await this.prisma.nurseAvailability.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        nurse: { include: { user: true, branch: true } },
        branch: true,
      },
    });

    if (!availability) {
      throw new NotFoundException("Availability not found");
    }

    return availability;
  }

  async update(id: string, dto: any, user: any) {
    await this.findOne(id, user);

    const { date, nurseId, branchId: requestedBranchId, ...rest } = dto;

    let branchId = requestedBranchId;
    if (branchId) {
      await assertBranchInOrganization(
        this.prisma,
        branchId,
        user.organizationId,
      );
    } else if (nurseId) {
      branchId = await resolveNurseBranch(
        this.prisma,
        nurseId,
        user.organizationId,
      );
    }

    return this.prisma.nurseAvailability.update({
      where: {
        id,
      },
      data: {
        ...rest,
        ...(nurseId ? { nurseId } : {}),
        ...(date ? { date: new Date(date).toISOString() } : {}),
        ...(branchId ? { branchId } : {}),
      },
      include: {
        nurse: { include: { user: true, branch: true } },
        branch: true,
      },
    });
  }
}
