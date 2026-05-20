import { Injectable, BadRequestException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class ScheduleValidationService {
  constructor(private readonly prisma: PrismaService) {}

  async validateSchedule(scheduleId: string) {
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

    if (!schedule) {
      throw new BadRequestException("Schedule not found");
    }

    /*
    |--------------------------------------------------------------------------
    | EXAMPLE VALIDATIONS
    |--------------------------------------------------------------------------
    */

    if (schedule.scheduleEntries.length === 0) {
      throw new BadRequestException("Schedule has no entries");
    }

    /*
    |--------------------------------------------------------------------------
    | TODO:
    |--------------------------------------------------------------------------
    |
    | - overlapping shifts
    | - fatigue validation
    | - restrictions
    | - minimum staff
    | - max hours
    | - consecutive nights
    |
    */

    return {
      valid: true,
    };
  }
}
