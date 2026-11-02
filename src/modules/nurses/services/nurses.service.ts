import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";

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
      nurseProfiles: true
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

  /**
   * Elimina una enfermera.
   * FLUJO EN CASCADA: si existe historial operativo (asignaciones, ausencias,
   * vacaciones, etc.), se bloquea el borrado físico y se recomienda marcarla
   * como INACTIVE, conservando el historial y la auditoría.
   */
  async remove(id: string, user: any) {
    await this.findOne(id, user);

    const [scheduleEntries, absences, vacations, leaves] = await Promise.all([
      this.prisma.scheduleEntry.count({ where: { nurseId: id } }),
      this.prisma.absence.count({ where: { nurseId: id } }),
      this.prisma.vacation.count({ where: { nurseId: id } }),
      this.prisma.leave.count({ where: { userId: id } }),
    ]);

    const operationalRecords = scheduleEntries + absences + vacations + leaves;
    if (operationalRecords > 0) {
      throw new BadRequestException(
        "This nurse has operational records (assignments, absences or vacations). " +
        "Mark the profile as INACTIVE instead of deleting it to preserve history and auditability.",
      );
    }

    return this.prisma.nurse.delete({
      where: {
        id,
      },
    });
  }
}
