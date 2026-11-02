import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "@infra/database/prisma.service";
import {
  assertBranchInOrganization,
  organizationScope,
} from "@common/utils/branch-scope";

const branchInclude = {
  branches: {
    include: {
      branch: true,
    },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
  },
} satisfies Prisma.DepartmentInclude;

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Adds backward-compatible `branchId` / `branch` (primary branch) fields to a
   * department payload while keeping the full `branches` collection available.
   */
  private withPrimaryBranch<T extends { branches?: any[] }>(department: T) {
    if (!department) return department;
    const branches = department.branches ?? [];
    const primary = branches.find((link) => link.isPrimary) ?? branches[0];
    return {
      ...department,
      branchId: primary?.branchId ?? null,
      branch: primary?.branch ?? null,
    };
  }

  private normalizeBranchSelection(dto: any): {
    branchIds: string[];
    primaryBranchId?: string;
  } {
    const legacy = dto.branchId ? [dto.branchId] : [];
    const list: string[] = Array.isArray(dto.branchIds)
      ? dto.branchIds.filter(Boolean)
      : legacy;

    const branchIds = Array.from(new Set(list));
    const primaryBranchId =
      dto.primaryBranchId && branchIds.includes(dto.primaryBranchId)
        ? dto.primaryBranchId
        : branchIds[0];

    return { branchIds, primaryBranchId };
  }

  private async validateBranches(
    branchIds: string[],
    organizationId: string,
  ): Promise<void> {
    if (branchIds.length === 0) {
      throw new BadRequestException(
        "A department must be linked to at least one branch (sede).",
      );
    }

    for (const branchId of branchIds) {
      await assertBranchInOrganization(
        this.prisma,
        branchId,
        organizationId,
      );
    }
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    );
  }

  private scopeWhere(user: any): Prisma.DepartmentWhereInput {
    const scope = organizationScope(user);
    return scope ? { organizationId: scope } : {};
  }

  /*
  |--------------------------------------------------------------------------
  | CREATE
  |--------------------------------------------------------------------------
  */

  async create(dto: any, user?: any) {
    const organizationId =
      organizationScope(user) || dto.organizationId || user?.organizationId;

    if (!organizationId) {
      throw new BadRequestException("organizationId is required.");
    }

    if (organizationScope(user) && dto.organizationId && dto.organizationId !== organizationId) {
      throw new ForbiddenException(
        "You cannot create departments for another organization.",
      );
    }

    const { branchIds, primaryBranchId } = this.normalizeBranchSelection(dto);
    await this.validateBranches(branchIds, organizationId);

    const { branchId, branchIds: _branchIds, primaryBranchId: _primary, ...rest } = dto;

    try {
      const created = await this.prisma.$transaction(async (tx) => {
        const department = await tx.department.create({
          data: {
            ...rest,
            organizationId,
            branches: {
              create: branchIds.map((id) => ({
                branchId: id,
                isPrimary: id === primaryBranchId,
              })),
            },
          },
          include: branchInclude,
        });

        return department;
      });

      return this.withPrimaryBranch(created);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          "A department with this code already exists in the organization.",
        );
      }
      throw error;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | FIND ALL
  |--------------------------------------------------------------------------
  */

  async findAll(query: any, user: any) {
    const where: Prisma.DepartmentWhereInput = {
      ...this.scopeWhere(user),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: "insensitive" } },
          { code: { contains: query.search, mode: "insensitive" } },
          {
            branches: {
              some: {
                branch: {
                  name: { contains: query.search, mode: "insensitive" },
                },
              },
            },
          },
        ],
      }),
      ...(query.branchId && {
        branches: { some: { branchId: query.branchId } },
      }),
      ...(query.type && { type: query.type }),
      ...(query.criticalLevel && { criticalLevel: query.criticalLevel }),
      ...(query.isEmergencyDepartment !== undefined && {
        isEmergencyDepartment:
          query.isEmergencyDepartment === true ||
          query.isEmergencyDepartment === "true",
      }),
      ...(query.isActive !== undefined && {
        isActive:
          query.isActive === true || query.isActive === "true",
      }),
    };

    const include: Prisma.DepartmentInclude = {
      ...branchInclude,
      nurses: true,
      shifts: true,
    };

    const orderBy: Prisma.DepartmentOrderByWithRelationInput = {
      createdAt: "desc",
    };

    // Paginación opcional: sin page/limit se mantiene el array plano (backward compatible)
    if (query.page || query.limit) {
      const page = Math.max(1, Number(query.page) || 1);
      const limit = Math.min(500, Math.max(1, Number(query.limit) || 25));
      const [data, total] = await Promise.all([
        this.prisma.department.findMany({
          where,
          include,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.department.count({ where }),
      ]);
      return {
        data: data.map((department) => this.withPrimaryBranch(department)),
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    }

    const departments = await this.prisma.department.findMany({
      where,
      include,
      orderBy,
    });

    return departments.map((department) =>
      this.withPrimaryBranch(department),
    );
  }

  /*
  |--------------------------------------------------------------------------
  | FIND ONE
  |--------------------------------------------------------------------------
  */

  async findOne(id: string, user: any) {
    const department = await this.prisma.department.findFirst({
      where: {
        id,
        ...this.scopeWhere(user),
      },
      include: {
        ...branchInclude,
        nurses: true,
        shifts: true,
        schedules: true,
        departmentConfigurations: true,
        departmentSpecialities: true,
      },
    });

    if (!department) {
      throw new NotFoundException("Department not found");
    }

    return this.withPrimaryBranch(department);
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE
  |--------------------------------------------------------------------------
  */

  async update(id: string, dto: any, user: any) {
    const current = await this.findOne(id, user);

    const { branchId, branchIds: rawBranchIds, primaryBranchId, organizationId: _organizationId, ...rest } = dto;
    const hasBranchSelection =
      rawBranchIds !== undefined || branchId !== undefined || primaryBranchId !== undefined;

    let selection: { branchIds: string[]; primaryBranchId?: string } | null = null;
    if (hasBranchSelection) {
      const currentLinks: string[] = (current.branches ?? []).map(
        (link: any) => link.branchId,
      );

      if (rawBranchIds !== undefined) {
        selection = this.normalizeBranchSelection({
          branchIds: rawBranchIds,
          primaryBranchId,
        });
      } else if (branchId !== undefined) {
        // Compatibilidad con clientes antiguos que envían una sola sede:
        // se conserva la sede indicada como principal sin perder las demás.
        selection = this.normalizeBranchSelection({
          branchIds: Array.from(new Set([...currentLinks, branchId])),
          primaryBranchId: branchId,
        });
      } else {
        selection = this.normalizeBranchSelection({
          branchIds: currentLinks,
          primaryBranchId,
        });
      }

      await this.validateBranches(selection.branchIds, current.organizationId);
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        if (selection) {
          const currentLinks: string[] = (current.branches ?? []).map(
            (link: any) => link.branchId,
          );
          const removedBranchIds = currentLinks.filter(
            (branchIdValue) => !selection!.branchIds.includes(branchIdValue),
          );

          if (removedBranchIds.length > 0) {
            const [schedules, templates, shifts, coverages, nurses, users] =
              await Promise.all([
                tx.schedule.count({
                  where: { departmentId: id, branchId: { in: removedBranchIds } },
                }),
                tx.shiftTemplate.count({
                  where: { departmentId: id, branchId: { in: removedBranchIds } },
                }),
                tx.shift.count({
                  where: { departmentId: id, branchId: { in: removedBranchIds } },
                }),
                tx.emergencyCoverages.count({
                  where: { departmentId: id, branchId: { in: removedBranchIds } },
                }),
                tx.nurse.count({
                  where: { departmentId: id, branchId: { in: removedBranchIds } },
                }),
                tx.user.count({
                  where: { departmentId: id, branchId: { in: removedBranchIds } },
                }),
              ]);

            if (schedules + templates + shifts + coverages + nurses + users > 0) {
              throw new BadRequestException(
                "No se puede desvincular una sede que tiene horarios, turnos, plantillas, coberturas o personal asociado. Conserva la sede para preservar el historial.",
              );
            }
          }

          await tx.departmentBranch.deleteMany({ where: { departmentId: id } });
          await tx.departmentBranch.createMany({
            data: selection.branchIds.map((branchIdValue) => ({
              departmentId: id,
              branchId: branchIdValue,
              isPrimary: branchIdValue === selection!.primaryBranchId,
            })),
          });
        }

        const updated = await tx.department.update({
          where: { id },
          data: rest,
          include: branchInclude,
        });

        return this.withPrimaryBranch(updated);
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          "A department with this code already exists in the organization.",
        );
      }
      throw error;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  /**
   * Elimina un departamento.
   * FLUJO EN CASCADA: si tiene personal o historial operativo, se bloquea el
   * borrado físico y se recomienda DESACTIVARLO (isActive=false). Al
   * desactivarlo, la asociación con las sucursales (DepartmentBranch) se
   * conserva para trazabilidad histórica, pero el frontend lo muestra marcado
   * como inactivo en lugar de contar como departamento operativo.
   * El AuditInterceptor registra la acción con el estado previo.
   */
  async remove(id: string, user: any) {
    await this.findOne(id, user);

    const [
      nurses,
      users,
      schedules,
      scheduleEntries,
      shiftTemplates,
      configurations,
    ] = await Promise.all([
      this.prisma.nurse.count({ where: { departmentId: id } }),
      this.prisma.user.count({ where: { departmentId: id } }),
      this.prisma.schedule.count({ where: { departmentId: id } }),
      this.prisma.scheduleEntry.count({
        where: { shiftTemplate: { departmentId: id } },
      }),
      this.prisma.shiftTemplate.count({ where: { departmentId: id } }),
      this.prisma.departmentConfiguration.count({ where: { departmentId: id } }),
    ]);

    const operationalRecords =
      nurses + users + schedules + scheduleEntries + shiftTemplates + configurations;

    if (operationalRecords > 0) {
      throw new BadRequestException(
        "This department has staff, schedules or operational records. " +
        "Deactivate it instead of deleting it to preserve history and auditability.",
      );
    }

    return this.prisma.department.delete({
      where: {
        id,
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | ASSIGN NURSES
  |--------------------------------------------------------------------------
  */

  async assignNurses(departmentId: string, dto: any, user: any) {
    const department = await this.findOne(departmentId, user);

    const allowedBranches: string[] = (department.branches ?? []).map(
      (link: any) => link.branchId,
    );
    const primaryBranchId =
      (department.branches ?? []).find((link: any) => link.isPrimary)
        ?.branchId ?? allowedBranches[0];

    const nurseIds: string[] = dto.nurseIds ?? [];

    return this.prisma.$transaction(async (tx) => {
      const result = await tx.nurse.updateMany({
        where: {
          id: { in: nurseIds },
          organizationId: user.organizationId,
        },
        data: {
          departmentId,
        },
      });

      if (primaryBranchId) {
        // Las enfermeras sin sede (o en una sede donde el departamento no
        // opera) se reasignan a la sede principal del departamento.
        await tx.nurse.updateMany({
          where: {
            id: { in: nurseIds },
            organizationId: user.organizationId,
            OR: [
              { branchId: null },
              { branchId: { notIn: allowedBranches } },
            ],
          },
          data: {
            branchId: primaryBranchId,
          },
        });
      }

      return result;
    });
  }
}
