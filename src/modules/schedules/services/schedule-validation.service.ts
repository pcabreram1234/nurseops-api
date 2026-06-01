import { Injectable, BadRequestException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class ScheduleValidationService {
  constructor(private readonly prisma: PrismaService) { }

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

  async validateAssignment(nurseId: string, date: Date, shiftId: string) {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // 1. Verificar Restricciones Activas (Tu módulo anterior)
    const restrictions = await this.prisma.nurseRestriction.findMany({
      where: { nurseId, isActive: true },
      include: { restrictionType: true }
    });

    // 2. Horas acumuladas en el mes
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const monthlyHours = await this.prisma.scheduleEntry.aggregate({
      where: { nurseId, date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { /* lógica de sumar duración de shifts */ }
    });

    // 3. Descanso mínimo (Ej: ¿Tiene turno en las últimas 12 horas?)
    const lastShift = await this.prisma.scheduleEntry.findFirst({
      where: { nurseId, date: { lt: date } },
      orderBy: { date: 'desc' }
    });

    // --- Lógica de Negocio ---
    if (restrictions.length > 0) {
      errors.push(`Tiene ${restrictions.length} restricciones médicas activas.`);
    }

    return {
      canAssign: errors.length === 0,
      errors,
      monthlyHours: monthlyHours._sum || 0,
      lastShiftDate: lastShift?.date
    };
  }
}
