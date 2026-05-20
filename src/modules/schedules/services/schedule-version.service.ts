import { Injectable } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class ScheduleVersionService {
  constructor(private readonly prisma: PrismaService) {}

  async createSnapshot(scheduleId: string) {
    /*
    |--------------------------------------------------------------------------
    | FIND SCHEDULE
    |--------------------------------------------------------------------------
    */

    const schedule = await this.prisma.schedule.findUnique({
      where: {
        id: scheduleId,
      },

      include: {
        scheduleEntries: {
          include: {
            shift: true,
          },
        },
      },
    });

    /*
    |--------------------------------------------------------------------------
    | GET LAST VERSION
    |--------------------------------------------------------------------------
    */

    const latestVersion = await this.prisma.scheduleVersion.findFirst({
      where: {
        scheduleId,
      },

      orderBy: {
        version: "desc",
      },
    });

    const nextVersion = latestVersion ? latestVersion.version + 1 : 1;

    /*
    |--------------------------------------------------------------------------
    | CREATE SNAPSHOT
    |--------------------------------------------------------------------------
    */

    return this.prisma.scheduleVersion.create({
      data: {
        scheduleId,

        version: nextVersion,

        snapshot: schedule as any,
      },
    });
  }
}
                                            