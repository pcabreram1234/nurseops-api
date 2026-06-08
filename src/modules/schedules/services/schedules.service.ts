import {
  Injectable,
  NotFoundException,
  BadRequestException, ConflictException
} from "@nestjs/common";
import { PrismaService } from "@infra/database/prisma.service";
import { ScheduleStatus, ActivityLogType } from "@prisma/client";
import { runScheduleEngine } from "../engines/run-schedule-engine";

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) { }

  /*
  |--------------------------------------------------------------------------
  | CREATE
  |--------------------------------------------------------------------------
  */

  async create(dto: any) {
    const exists = await this.prisma.schedule.findFirst({
      where: {
        departmentId: dto.departmentId,

        month: dto.month,

        year: dto.year,
      },
    });

    if (exists) {
      throw new BadRequestException("Schedule already exists for this period");
    }

    return this.prisma.schedule.create({
      data: dto,

      include: {
        department: true,
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | FIND ALL
  |--------------------------------------------------------------------------
  */

  async findAll(query: any, user: any) {
    return this.prisma.schedule.findMany({
      where: {
        organizationId: user.organizationId,

        ...(query.departmentId && {
          departmentId: query.departmentId,
        }),

        ...(query.month && {
          month: query.month,
        }),

        ...(query.year && {
          year: query.year,
        }),

        ...(query.status && {
          status: query.status,
        }),
      },

      include: {
        department: true,

        scheduleEntries: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | FIND ONE
  |--------------------------------------------------------------------------
  */

  async findOne(id: string, user: any) {
    const schedule = await this.prisma.schedule.findFirst({
      where: {
        id,

        organizationId: user.organizationId,
      },

      include: {
        department: true,

        scheduleEntries: {
          include: {
            shift: true,
          },
        },

        scheduleVersions: true,

        optimizationRuns: true,
      },
    });

    if (!schedule) {
      throw new NotFoundException("Schedule not found");
    }

    return schedule;
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE
  |--------------------------------------------------------------------------
  */

  async update(id: string, dto: any, user: any) {
    await this.findOne(id, user);

    return this.prisma.schedule.update({
      where: {
        id,
      },

      data: dto,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  async remove(id: string, user: any) {
    await this.findOne(id, user);

    return this.prisma.schedule.delete({
      where: {
        id,
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | PUBLISH
  |--------------------------------------------------------------------------
  */

  async publish(id: string, user: any) {
    await this.findOne(id, user);

    return this.prisma.schedule.update({
      where: {
        id,
      },

      data: {
        status: ScheduleStatus.PUBLISHED,

        publishedAt: new Date(),

        publishedById: user.sub,
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | GENERATE
  |--------------------------------------------------------------------------
  */

  a/*
  |--------------------------------------------------------------------------
  | GENERATE AUTOMATED (Engine Integrator)
  |--------------------------------------------------------------------------
  */
  async generateAutomated(dto: any, user: any) {
    const { departmentId, month, year } = dto;
    const systemBotId = user.id || user.sub;

    /*
    |--------------------------------------------------------------------------
    | VALIDACIONES PREVENTIVAS CRÍTICAS (Fail-Fast)
    |--------------------------------------------------------------------------
    */

    // 1. Verificar la existencia real del departamento y sus plantillas de turnos asociadas
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        shiftTemplates: true,
        organization: true,
      },
    });

    if (!department) {
      throw new NotFoundException(`Operation Cancelled: The selected department does not exist.`);
    }

    if (!department.shiftTemplates || department.shiftTemplates.length === 0) {
      throw new BadRequestException(
        `Incomplete Configuration: The department "${department.name}" does not have any ShiftTemplates configured. The rules engine cannot simulate spaces without requirements.`
      );
    }

    // 2. Buscar si ya existe algún registro de calendario para este periodo exacto
    const existingSchedule = await this.prisma.schedule.findFirst({
      where: {
        departmentId,
        month,
        year,
      },
    });

    if (existingSchedule) {
      // SITUACIÓN A: El horario ya está publicado y es inmutable
      if (existingSchedule.status === ScheduleStatus.PUBLISHED) {
        throw new ConflictException(
          `Acción Bloqueada: El horario para el periodo ${month}/${year} ya se encuentra PUBLICADO de forma oficial. No se permite volver a ejecutar el motor de reglas sobre un cuadrante activo para proteger la consistencia del personal.`
        );
      }

      // SITUACIÓN B: El motor ya está corriendo en segundo plano para este depto
      if (existingSchedule.status === ScheduleStatus.GENERATING) {
        throw new BadRequestException(
          `Process in Progress: The optimization engine is currently calculating allocations for the period ${month}/${year}. Please wait for the current process to complete.`
        );
      }

      // SITUACIÓN C: Existe un BORRADOR (DRAFT) previo.
      // Para evitar acumular basura transaccional, procedemos a limpiar las asignaciones viejas 
      // de este borrador antes de lanzar el motor de optimización nuevamente.
      await this.prisma.$transaction(async (tx) => {
        // Eliminamos las entradas del borrador anterior
        await tx.scheduleEntry.deleteMany({
          where: { scheduleId: existingSchedule.id },
        });

        // Cambiamos temporalmente el estado para indicar reinicio
        await tx.schedule.update({
          where: { id: existingSchedule.id },
          data: {
            status: ScheduleStatus.GENERATING,
            autoGenerated: true
          },
        });
      });
    }

    /*
    |--------------------------------------------------------------------------
    | EJECUCIÓN DEL SCHEDULE ENGINE
    |--------------------------------------------------------------------------
    */
    try {
      // Determinamos la fecha objetivo estructurada (Día 1 del mes a procesar)
      const targetDate = new Date(year, month - 1, 1);

      // Filtramos plantillas asignadas a este depto específico
      const departmentShiftTemplates = department.shiftTemplates.filter(
        (template) => template.departmentId === department.id
      );

      // Invocamos tu motor de asignaciones óptimas
      const result = await runScheduleEngine(
        this.prisma,
        department.organizationId,
        department.id,
        targetDate,
        departmentShiftTemplates,
        systemBotId
      );

      if (!result.success) {
        // Si el motor falló internamente (ej: falta de personal para cubrir la demanda)
        // Revertimos el estado del cronograma si existía
        if (existingSchedule) {
          await this.prisma.schedule.update({
            where: { id: existingSchedule.id },
            data: { status: ScheduleStatus.DRAFT },
          });
        }

        throw new BadRequestException(
          `Rules Engine Error: The optimal schedule could not be structured. Reason: ${result.error || 'Insurmountable rest restrictions.'}`
        );
      }

      /*
      |--------------------------------------------------------------------------
      | AUDITORÍA DE GENERACIÓN SUCCESSFUL
      |--------------------------------------------------------------------------
      */
      await this.prisma.activityLog.create({
        data: {
          userId: systemBotId,
          action: ActivityLogType.ENGINE_EXECUTED, // O introduce un enum como ENGINE_EXECUTED si dispones de él
          details: {
            message: `Engine triggered manually. Quadrant successfully auto-generated for the period ${month}/${year}.`,
            departmentId,
            scheduleId: result.scheduleId,
          },
        },
      });

      return {
        success: true,
        message: `Simulated and successfully generated quadrant! The draft for the period ${month}/${year} has been created.`,
        scheduleId: result.scheduleId,
      };

    } catch (error: any) {
      // Si es una excepción controlada de NestJS la relanzamos directamente
      if (error instanceof BadRequestException || error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      // Cualquier otro error imprevisto del motor de base de datos o de sintaxis
      throw new BadRequestException(
        `Critical simulation error: An unexpected problem occurred while compiling the engine. Details: ${error.message}`
      );
    }
  }
}
