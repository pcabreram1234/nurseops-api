import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "@infra/database/prisma.service";
import { ScheduleStatus, ActivityLogType } from "@prisma/client";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  resolveDepartmentBranch,
  assertDepartmentServesBranch,
} from "@common/utils/branch-scope";
import { runScheduleEngine } from "../engines/run-schedule-engine";
import { PaginationDto } from "../dto/pagination.dto";

export interface UserOrgContext {
  organizationId?: string;
  departmentId?: string;
  role?: string;
  id?: string;
  sub?: string;
}

/**
 * Resuelve el departmentId del usuario a partir del JWT.
 */
async function resolveUserDepartmentId(prisma: PrismaService, userOrg: UserOrgContext): Promise<string | undefined> {
  if (userOrg.departmentId) {
    return userOrg.departmentId;
  }
  const userId = userOrg.id || userOrg.sub;
  if (!userId) return undefined;

  const nurse = await prisma.nurse.findFirst({
    where: { userId },
    select: { departmentId: true },
  });
  return nurse?.departmentId;
}

/**
 * Verifica si el usuario puede crear/operar sobre un departamento dado.
 * - SUPER: sin restricciones.
 * - HR_MANAGER / SYSTEM_ADMIN: cualquier departamento de su organización.
 * - HEAD_DEPARTMENT / SUPERVISOR: solo su propio departamento.
 */
function checkDepartmentPermission(departmentId: string, departmentOrgId: string | undefined, userOrg: UserOrgContext): void {
  if (!userOrg) {
    throw new ForbiddenException("Contexto de usuario no disponible.");
  }

  if (userOrg.role === "SUPER") return;

  if (departmentOrgId && userOrg.organizationId && departmentOrgId !== userOrg.organizationId) {
    throw new ForbiddenException("El departamento no pertenece a su organización.");
  }

  if (["HR_MANAGER", "SYSTEM_ADMIN"].includes(userOrg.role!)) {
    return;
  }

  if (["HEAD_DEPARTMENT", "NIGHT_SUPERVISOR", "SUPERVISOR"].includes(userOrg.role!)) {
    if (!userOrg.departmentId || departmentId !== userOrg.departmentId) {
      throw new ForbiddenException("Solo puede operar sobre su propio departamento.");
    }
    return;
  }

  throw new ForbiddenException("Su rol no tiene permiso para operar sobre este departamento.");
}

@Injectable()
export class SchedulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  private buildWhere(userOrg?: UserOrgContext) {
    const where: any = {};

    if (userOrg && userOrg.role !== 'SUPER') {
      if (userOrg.organizationId) {
        where.organizationId = userOrg.organizationId;
      }
    }

    return where;
  }

  async create(dto: any, userOrg?: UserOrgContext) {
    // Resolver departmentId del usuario para validación de permisos
    const userDeptId = await resolveUserDepartmentId(this.prisma, userOrg ?? {});
    const userCtx = {
      ...userOrg,
      departmentId: userDeptId || userOrg?.departmentId,
    };

    // Validar que el departamento del DTO exista y pertenezca a la org del usuario
    const targetDept = await this.prisma.department.findUnique({
      where: { id: dto.departmentId },
      select: { organizationId: true },
    });

    if (!targetDept) {
      throw new NotFoundException(`Department with id ${dto.departmentId} not found.`);
    }

    // Verificar permisos según rol
    checkDepartmentPermission(dto.departmentId, targetDept.organizationId, userCtx);

    const organizationId = userCtx.organizationId || targetDept.organizationId || dto.organizationId;

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

  async findAll(query: any, userOrg?: UserOrgContext) {
    const where = this.buildWhere(userOrg);

    return this.prisma.schedule.findMany({
      where: {
        ...where,

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

  async findOne(id: string, userOrg?: UserOrgContext) {
    const where: any = {
      id,
      ...this.buildWhere(userOrg),
    };

    const schedule = await this.prisma.schedule.findFirst({
      where,

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

  async update(id: string, dto: any, userOrg?: UserOrgContext) {
    const current = await this.findOne(id, userOrg);

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

      if (branchId !== current.branchId) {
        await tx.scheduleEntry.updateMany({
          where: { scheduleId: id },
          data: { branchId },
        });
      }

      return updated;
    });
  }

  async remove(id: string, userOrg?: UserOrgContext) {
    await this.findOne(id, userOrg);

    return this.prisma.schedule.delete({
      where: {
        id,
      },
    });
  }

  async publish(id: string, userOrg?: UserOrgContext) {
    await this.findOne(id, userOrg);

    return this.prisma.schedule.update({
      where: {
        id,
      },

      data: {
        status: ScheduleStatus.PUBLISHED,

        publishedAt: new Date(),

        publishedById: userOrg!.sub!,
      },
    });
  }

  async generateAutomated(dto: any, userOrg?: UserOrgContext) {
    // Resolver departmentId del usuario para validación de permisos
    const userDeptId = await resolveUserDepartmentId(this.prisma, userOrg ?? {});
    const userCtx = {
      ...userOrg,
      departmentId: userDeptId || userOrg?.departmentId,
    };

    const { departmentId, month, year } = dto;

    // Validar que el departamento exista y que el usuario tenga permisos
    const targetDept = await this.prisma.department.findUnique({
      where: { id: departmentId },
      select: { organizationId: true },
    });

    if (!targetDept) {
      throw new NotFoundException(`Department with id ${departmentId} not found.`);
    }

    // Verificar permisos según rol
    checkDepartmentPermission(departmentId, targetDept.organizationId, userCtx);

    const systemBotId = userCtx!.id || userCtx!.sub || "system-bot";
    const organizationId = userCtx?.organizationId || targetDept.organizationId || dto.organizationId;

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

    const existingSchedule = await this.prisma.schedule.findFirst({
      where: {
        departmentId,
        branchId,
        month,
        year,
      },
    });

    if (existingSchedule) {
      if (existingSchedule.status === ScheduleStatus.PUBLISHED) {
        throw new ConflictException(
          `Acción Bloqueada: El horario para el periodo ${month}/${year} ya se encuentra PUBLICADO de forma oficial. No se permite volver a ejecutar el motor de reglas sobre un cuadrante activo para proteger la consistencia del personal.`,
        );
      }

      if (existingSchedule.status === ScheduleStatus.GENERATING) {
        throw new BadRequestException(
          `Process in Progress: The optimization engine is currently calculating allocations for the period ${month}/${year}. Please wait for the current process to complete.`,
        );
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.scheduleEntry.deleteMany({
          where: { scheduleId: existingSchedule.id },
        });

        await tx.schedule.update({
          where: { id: existingSchedule.id },
          data: {
            status: ScheduleStatus.GENERATING,
            autoGenerated: true,
          },
        });
      });
    }

    try {
      const targetDate = new Date(year, month - 1, 1);

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

      await this.prisma.activityLog.create({
        data: {
          userId: systemBotId,
          action: ActivityLogType.ENGINE_EXECUTED,
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
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Critical simulation error: An unexpected problem occurred while compiling the engine. Details: ${error.message}`,
      );
    }
  }
}
