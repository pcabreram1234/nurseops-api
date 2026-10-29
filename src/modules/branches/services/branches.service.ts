import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "@infra/database/prisma.service";
import { organizationScope } from "@common/utils/branch-scope";

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  private scopeWhere(user: any): Prisma.BranchWhereInput {
    const organizationId = organizationScope(user);
    return organizationId ? { organizationId } : {};
  }

  private assertOrganizationAccess(user: any, organizationId?: string) {
    const scope = organizationScope(user);
    if (scope && organizationId && scope !== organizationId) {
      throw new ForbiddenException(
        "You cannot manage branches of another organization.",
      );
    }
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    );
  }

  async create(dto: any, user: any) {
    const organizationId = dto.organizationId || user?.organizationId;
    this.assertOrganizationAccess(user, organizationId);

    if (!organizationId) {
      throw new BadRequestException("organizationId is required.");
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        if (dto.isMainBranch) {
          await tx.branch.updateMany({
            where: { organizationId, isMainBranch: true },
            data: { isMainBranch: false },
          });
        }

        return tx.branch.create({
          data: { ...dto, organizationId },
          include: {
            departments: {
              include: {
                department: { select: { id: true, name: true, code: true } },
              },
            },
            organization: true,
          },
        });
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          "A branch with this name already exists in the organization.",
        );
      }
      throw error;
    }
  }

  async findAll(query: any, user: any) {
    return this.prisma.branch.findMany({
      where: {
        ...this.scopeWhere(user),
        ...(query.isActive !== undefined && {
          isActive:
            query.isActive === true ||
            query.isActive === "true",
        }),
        ...(query.isMainBranch !== undefined && {
          isMainBranch:
            query.isMainBranch === true ||
            query.isMainBranch === "true",
        }),
        ...(query.search && {
          OR: [
            { name: { contains: query.search, mode: "insensitive" } },
            { address: { contains: query.search, mode: "insensitive" } },
            { city: { contains: query.search, mode: "insensitive" } },
          ],
        }),
        ...(query.city && { city: query.city }),
        ...(query.country && { country: query.country }),
      },
      include: {
        departments: {
          include: {
            department: { select: { id: true, name: true, code: true } },
          },
        },
        organization: true,
        _count: {
          select: {
            users: true,
            nurses: true,
            schedules: true,
            shifts: true,
          },
        },
      },
      orderBy: [{ isMainBranch: "desc" }, { createdAt: "desc" }],
    });
  }

  async findOne(id: string, user: any) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, ...this.scopeWhere(user) },
      include: {
        departments: {
          include: {
            department: {
              select: {
                id: true,
                name: true,
                code: true,
                type: true,
                isActive: true,
              },
            },
          },
        },
        organization: true,
        _count: {
          select: {
            departments: true,
            users: true,
            nurses: true,
            schedules: true,
            scheduleEntries: true,
            shifts: true,
            shiftTemplates: true,
            absences: true,
            vacations: true,
            leaves: true,
            nurseAvailabilities: true,
            emergencyCoverages: true,
          },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException("Branch not found");
    }

    return branch;
  }

  async update(id: string, dto: any, user: any) {
    const current = await this.findOne(id, user);
    this.assertOrganizationAccess(user, dto.organizationId);

    try {
      return await this.prisma.$transaction(async (tx) => {
        if (dto.isMainBranch) {
          await tx.branch.updateMany({
            where: {
              organizationId: current.organizationId,
              isMainBranch: true,
              NOT: { id },
            },
            data: { isMainBranch: false },
          });
        }

        return tx.branch.update({
          where: { id },
          data: dto,
        });
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          "A branch with this name already exists in the organization.",
        );
      }
      throw error;
    }
  }

  async remove(id: string, user: any) {
    const branch = await this.findOne(id, user);

    const operationalRecords =
      branch._count.nurses +
      branch._count.schedules +
      branch._count.scheduleEntries +
      branch._count.shifts +
      branch._count.shiftTemplates +
      branch._count.absences +
      branch._count.vacations +
      branch._count.leaves +
      branch._count.nurseAvailabilities +
      branch._count.emergencyCoverages;

    if (branch._count.departments > 0 || operationalRecords > 0) {
      throw new BadRequestException(
        "This branch has departments or operational records. Deactivate it instead of deleting it to preserve historical data.",
      );
    }

    return this.prisma.branch.delete({ where: { id } });
  }

  /**
   * Public helper used by other modules to validate branch tenant scope.
   */
  async assertInOrganization(branchId: string, organizationId?: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { id: true, organizationId: true, isActive: true },
    });

    if (!branch) {
      throw new NotFoundException("Branch not found");
    }

    if (organizationId && branch.organizationId !== organizationId) {
      throw new ForbiddenException(
        "The selected branch does not belong to your organization.",
      );
    }

    return branch;
  }
}
