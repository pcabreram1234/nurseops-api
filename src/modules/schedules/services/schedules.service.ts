import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "@infra/database/prisma.service";
import { ScheduleStatus, ActivityLogType } from "@prisma/client";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  resolveDepartmentBranch,
  assertDepartmentServesBranch,
} from "@common/utils/branch-scope";
import { runScheduleEngine } from "../engines/run-schedule-engine";

@Injectable()
export class SchedulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /*
  |--------------------------------------------------------------------------
  | CREATE
  |--------------------------------------------------------------------------
  */

  async create(dto: any, user?: any) {
    const organizationId = user?.organizationId || dto.organizationId;

    if (!organizationId) {
      throw new BadRequestException("organizationId is required.");
    }

    const branchId = await resolveDepartmentBranch(
      this.prisma,
      dto.departmentId,
      organizationId,
      dto.branchId,
    );

    const exists = await this.prisma.schedule.findFirst({
      where: {
        departmentId: dto.departmentId,
        branchId,
        month: dto.month,
        year: dto.year,
      },
    });

    if (exists) {
      throw new BadRequestException(
        "Schedule already exists for this department, branch and period",
      );
    }

    return this.prisma.schedule.create({
      data: {
        ...dto,
        organizationId,
        branchId,
      },

      include: {
        department: true,
        branch: true,
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

        ...(query.branchId && {
          branchId: query.branchId,
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
        branch: true,
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
        department: {
          include: {
            branches: { include: { branch: true } },
          },
        },
        branch: true,

        scheduleEntries: {
          include: {
            shift: true,
            branch: true,
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
    const current = await this.findOne(id, user);

    const departmentId = dto.departmentId ?? current.departmentId;

    let branchId = current.branchId;
    if (dto.branchId || dto.departmentId) {
      branchId = await resolveDepartmentBranch(
        this.prisma,
        departmentId,
        current.organizationId,
        dto.branchId,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const { organizationId: _ignoredOrganizationId, ...rest } = dto;

      const updated = await tx.schedule.update({
        where: { id },
        data: {
          ...rest,
          branchId,
        },
        include: {
          department: true,
          branch: true,
        },
      });

      // Keep the denormalized branch of existing entries consistent with the
      // schedule branch (the database trigger enforces it per row).
      if (branchId !== current.branchId) {
        await tx.scheduleEntry.updateMany({
          where: { scheduleId: id },
          data: { branchId },
        });
      }

      return updated;
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

  /*
  |--------------------------------------------------------------------------
  | GENERATE AUTOMATED (Engine Integrator)
  |--------------------------------------------------------------------------
  */
  async generateAutomated(dto: any, user: any) {
    const { departmentId, month, year } = dto;
    const systemBotId = user.id || user.sub;
    const organizationId = user.organizationId || dto.organizationId;

    /*
    |--------------------------------------------------------------------------
    | VALIDACIONES PREVENTIVAS CRÍTICAS (Fail-Fast)
    |--------------------------------------------------------------------------
    */

    // 1. Resolver la sede del horario y verificar que el departamento opere en ella.
    const branchId = await resolveDepartmentBranch(
      this.prisma,
      departmentId,
      organizationId,
      dto.branchId,
    );

    await assertDepartmentServesBranch(this.prisma, departmentId, branchId);

    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        organization: true,
      },
    });

    if (!department) {
      throw new NotFoundException(
        `Operation Cancelled: The selected department does not exist.`,
      );
    }

    // Las plantillas se comparten por sede. Una plantilla puede ser de toda la
    // sede (departmentId null) o estar acotada a un departamento concreto.
    const branchShiftTemplates = await this.prisma.shiftTemplate.findMany({
      where: {
        organizationId: department.organizationId,
        branchId,
        isActive: true,
        OR: [{ departmentId }, { departmentId: null }],
      },
    });

    if (branchShiftTemplates.length === 0) {
      throw new BadRequestException(
        `Incomplete Configuration: The branch does not have any ShiftTemplates configured for the department "${department.name}". The rules engine cannot simulate spaces without requirements.`,
      );
    }

    // 2. Buscar si ya existe algún registro de calendario para este periodo exacto
    const existingSchedule = await this.prisma.schedule.findFirst({
      where: {
        departmentId,
        branchId,
        month,
        year,
      },
    });

    if (existingSchedule) {
      // SITUACIÓN A: El horario ya está publicado y es inmutable
      if (existingSchedule.status === ScheduleStatus.PUBLISHED) {
        throw new ConflictException(
          `Acción Bloqueada: El horario para el periodo ${month}/${year} ya se encuentra PUBLICADO de forma oficial. No se permite volver a ejecutar el motor de reglas sobre un cuadrante activo para proteger la consistencia del personal.`,
        );
      }

      // SITUACIÓN B: El motor ya está corriendo en segundo plano para este depto
      if (existingSchedule.status === ScheduleStatus.GENERATING) {
        throw new BadRequestException(
          `Process in Progress: The optimization engine is currently calculating allocations for the period ${month}/${year}. Please wait for the current process to complete.`,
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
            autoGenerated: true,
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

      // Invocamos tu motor de asignaciones óptimas
      const result = await runScheduleEngine(
        this.prisma,
        department.organizationId,
        department.id,
        branchId,
        targetDate,
        branchShiftTemplates,
        systemBotId,
        this.eventEmitter,
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
          `Rules Engine Error: The optimal schedule could not be structured. Reason: ${result.error || "Insurmountable rest restrictions."}`,
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
            branchId,
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
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      // Cualquier otro error imprevisto del motor de base de datos o de sintaxis
      throw new BadRequestException(
        `Critical simulation error: An unexpected problem occurred while compiling the engine. Details: ${error.message}`,
      );
    }
  }
}
