import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";
import { Prisma } from "@prisma/client";
import {
  assertBranchInOrganization,
  resolveDepartmentBranch,
} from "@common/utils/branch-scope";

@Injectable()
export class NursesService {
  constructor(private readonly prisma: PrismaService) { }

  private async resolveBranch(dto: any, organizationId: string) {
    if (dto.branchId) {
      if (dto.departmentId) {
        return resolveDepartmentBranch(
          this.prisma,
          dto.departmentId,
          organizationId,
          dto.branchId,
        );
      }

      await assertBranchInOrganization(
        this.prisma,
        dto.branchId,
        organizationId,
      );
      return dto.branchId as string;
    }

    if (dto.departmentId) {
      return resolveDepartmentBranch(
        this.prisma,
        dto.departmentId,
        organizationId,
      );
    }

    return undefined;
  }

  async create(dto: any, user: any) {
    const nurse = await this.prisma.nurse.findFirst({
      where: {
        userId: dto.userId,
      },
    });

    if (nurse) {
      throw new NotFoundException("This Nurse is already register");
    }

    const branchId = await this.resolveBranch(dto, user.organizationId);

    return this.prisma.nurse.create({
      data: {
        ...dto,
        ...(branchId ? { branchId } : {}),
        organizationId: user.organizationId,
      },
      include: {
        branch: true,
        department: {
          include: {
            branches: { include: { branch: true } },
          },
        },
      },
    });
  }

  async findAll(query: any, user: any) {
    const where: Prisma.NurseWhereInput = {
      organizationId: user.organizationId,
      ...(query.search && {
        OR: [
          {
            user: {
              firstName: { contains: query.search, mode: "insensitive" },
            },
          },
          {
            user: {
              lastName: { contains: query.search, mode: "insensitive" },
            },
          },
        ],
      }),
      ...(query.status && {
        status: query.status,
      }),
      ...(query.departmentId && {
        departmentId: query.departmentId,
      }),
      ...(query.branchId && {
        branchId: query.branchId,
      }),
      ...(query.contractType && {
        contractType: query.contractType,
      }),
    };

    const include: Prisma.NurseInclude = {
      user: {
        select: {
          firstName: true,
          lastName: true,
          id: true,
          email: true,
        },
      },
      department: {
        select: {
          name: true,
          id: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
          isMainBranch: true,
        },
      },
      speciality: {
        select: {
          name: true,
          id: true,
        },
      },
    };

    const orderBy: Prisma.NurseOrderByWithRelationInput = { hire_date: "desc" };

    // Paginación opcional
    if (query.page || query.limit) {
      const page = Math.max(1, Number(query.page) || 1);
      const limit = Math.min(500, Math.max(1, Number(query.limit) || 10));
      const [data, total] = await Promise.all([
        this.prisma.nurse.findMany({
          where,
          include,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.nurse.count({ where }),
      ]);
      return {
        data,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    }

    return this.prisma.nurse.findMany({
      where,
      include,
      orderBy,
    });
  }

  async findOne(id: string, user: any) {
    const nurse = await this.prisma.nurse.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },

      include: {
        workLoadMetrics: true,
        branch: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        department: {
          include: {
            branches: { include: { branch: true } },
          },
        },
      },
    });

    if (!nurse) {
      throw new NotFoundException("Nurse not found");
    }

    return nurse;
  }

  async update(id: string, dto: any, user: any) {
    const current = await this.findOne(id, user);

    const branchId =
      dto.branchId || dto.departmentId
        ? await this.resolveBranch(
            {
              ...dto,
              departmentId: dto.departmentId ?? current.departmentId,
            },
            user.organizationId,
          )
        : undefined;

    return this.prisma.nurse.update({
      where: {
        id,
      },

      data: {
        ...dto,
        ...(branchId ? { branchId } : {}),
      },
      include: {
        branch: true,
      },
    });
  }

  async remove(id: string, user: any) {
    await this.findOne(id, user);

    return this.prisma.nurse.delete({
      where: {
        id,
      },
    });
  }
}
