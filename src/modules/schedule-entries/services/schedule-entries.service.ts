import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class ScheduleEntriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any, user: any) {
    return this.prisma.scheduleEntry.create({
      data: {
        ...dto,
        organizationId: user.organizationId,
      },
    });
  }

  async findAll(query: any, user: any) {
    return this.prisma.scheduleEntry.findMany({
      where: {
        organizationId: user.organizationId,
        ...(query.scheduleId && {
          scheduleId: query.scheduleId,
        }),
        ...(query.nurseId && {
          nurseId: query.nurseId,
        }),
        ...(query.shiftId && {
          shiftId: query.shiftId,
        }),
        ...(query.startDate &&
          query.endDate && {
            date: {
              gte: new Date(query.startDate),
              lte: new Date(query.endDate),
            },
          }),
      },

      include: {
        nurse: true,
        shift: true,
        schedule: true,
      },
      orderBy: {
        date: "asc",
      },
    });
  }

  async findOne(id: string, user: any) {
    const entry = await this.prisma.scheduleEntry.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        nurse: true,
        shift: true,
      },
    });

    if (!entry) {
      throw new NotFoundException("Schedule entry not found");
    }

    return entry;
  }

  async update(id: string, dto: any, user: any) {
    await this.findOne(id, user);
    return this.prisma.scheduleEntry.update({
      where: {
        id,
      },

      data: dto,
    });
  }
}
