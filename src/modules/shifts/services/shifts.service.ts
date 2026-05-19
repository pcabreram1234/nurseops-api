import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class ShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.shift.create({
      data: dto,
      include: {
        department: true,
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

        ...(query.type && {
          type: query.type,
        }),

        ...(query.isNightShift !== undefined && {
          isNightShift: query.isNightShift,
        }),

        ...(query.isEmergencyShift !== undefined && {
          isEmergencyShift: query.isEmergencyShift,
        }),
      },

      include: {
        department: true,
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

    return this.prisma.shift.update({
      where: {
        id,
      },

      data: dto,
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
