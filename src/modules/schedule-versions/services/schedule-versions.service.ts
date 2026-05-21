import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class ScheduleVersionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any) {
    const latestVersion = await this.prisma.scheduleVersion.findFirst({
      where: {
        scheduleId: dto.scheduleId,
      },

      orderBy: {
        version: "desc",
      },
    });

    const nextVersion = (latestVersion?.version || 0) + 1;

    return this.prisma.scheduleVersion.create({
      data: {
        ...dto,

        version: nextVersion,
      },
    });
  }

  async findAll(scheduleId: string) {
    return this.prisma.scheduleVersion.findMany({
      where: {
        scheduleId,
      },

      orderBy: {
        version: "desc",
      },
    });
  }

  async findOne(id: string) {
    const version = await this.prisma.scheduleVersion.findUnique({
      where: { id },
    });

    if (!version) {
      throw new NotFoundException("Schedule version not found");
    }

    return version;
  }
}
