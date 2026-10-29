import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";
import {
  assertBranchInOrganization,
  resolveDepartmentBranch,
} from "@common/utils/branch-scope";

@Injectable()
export class ShiftsService {
  constructor(private readonly prisma: PrismaService) { }

  private async resolveBranch(dto: any, organizationId: string) {
    if (dto.departmentId) {
      return resolveDepartmentBranch(
        this.prisma,
        dto.departmentId,
        organizationId,
        dto.branchId,
      );
    }

    if (dto.branchId) {
      await assertBranchInOrganization(
        this.prisma,
        dto.branchId,
        organizationId,
      );
      return dto.branchId as string;
    }

    return undefined;
  }

  async create(dto: any, user?: any) {
    const organizationId = user?.organizationId || dto.organizationId;
    const branchId = organizationId
      ? await this.resolveBranch(dto, organizationId)
      : dto.branchId;

    return this.prisma.shift.create({
      data: {
        ...dto,
        ...(organizationId ? { organizationId } : {}),
        ...(branchId ? { branchId } : {}),
      },
      include: {
        department: true,
        branch: true,
      },
    });
  }

  async findAll(query: any, user: any) {
    return this.prisma.shift.findMany({
      where: {
        organizationId: user.organizationId,

        ...(query.search && {
          OR: [
            {
              name: {
                contains: query.search,
                mode: "insensitive",
              },
            },
            {
              code: {
                contains: query.search,
                mode: "insensitive",
              },
            },
          ],
        }),

        ...(query.departmentId && {
          departmentId: query.departmentId,
        }),

        ...(query.branchId && {
          branchId: query.branchId,
        }),

        ...(query.type && {
          type: query.type,
        }),

        ...(query.isNightShift !== undefined && {
          // Aseguramos la conversión a booleano si viene como string desde la URL
          isNightShift:
            query.isNightShift === "true" || query.isNightShift === true,
        }),

        ...(query.isEmergencyShift !== undefined && {
          isEmergencyShift:
            query.isEmergencyShift === "true" ||
            query.isEmergencyShift === true,
        }),

        // 🕒 NUEVO: Filtro por rango de inicio del turno (startTime)
        ...(query.startDate && {
          startTime: {
            gte: new Date(query.startDate),
          },
        }),

        // 🕒 NUEVO: Filtro por rango de finalización del turno (endTime)
        ...(query.endDate && {
          endTime: {
            lte: new Date(query.endDate),
          },
        }),
      },

      include: {
        department: true,
        branch: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOne(id: string, user: any) {
    const shift = await this.prisma.shift.findFirst({
      where: {
        id,

        organizationId: user.organizationId,
      },

      include: {
        department: true,
        branch: true,

        scheduleEntries: true,
      },
    });

    if (!shift) {
      throw new NotFoundException("Shift not found");
    }

    return shift;
  }

  async update(id: string, dto: any, user: any) {
    await this.findOne(id, user);

    const branchId = await this.resolveBranch(dto, user.organizationId);

    return this.prisma.shift.update({
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

    return this.prisma.shift.delete({
      where: {
        id,
      },
    });
  }
}
