import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";
import {
  assertBranchInOrganization,
  resolveDepartmentBranch,
} from "@common/utils/branch-scope";

@Injectable()
export class ShiftTemplatesService {
  constructor(private readonly prisma: PrismaService) { }

  private async resolveBranch(
    dto: any,
    organizationId: string,
  ): Promise<string> {
    if (dto.departmentId) {
      return resolveDepartmentBranch(
        this.prisma,
        dto.departmentId,
        organizationId,
        dto.branchId,
      );
    }

    if (!dto.branchId) {
      throw new BadRequestException(
        "A branch (sede) is required for a shift template.",
      );
    }

    await assertBranchInOrganization(
      this.prisma,
      dto.branchId,
      organizationId,
    );
    return dto.branchId;
  }

  async create(dto: any, user?: any) {
    const organizationId = user?.organizationId || dto.organizationId;

    if (!organizationId) {
      throw new BadRequestException("organizationId is required.");
    }

    const branchId = await this.resolveBranch(dto, organizationId);

    return this.prisma.shiftTemplate.create({
      data: {
        ...dto,
        organizationId,
        branchId,
      },
      include: {
        branch: true,
        department: true,
      },
    });
  }

  async findAll(query: any, user: any) {
    const isSuperAdmin = user.role === "SUPER";

    return this.prisma.shiftTemplate.findMany({
      where: {
        ...(isSuperAdmin
          ? {}
          : {
            organizationId: user.organizationId,
          }),
        ...(query?.branchId && { branchId: query.branchId }),
        ...(query?.departmentId && {
          OR: [
            { departmentId: query.departmentId },
            { departmentId: null },
          ],
        }),
      },
      include: {
        branch: true,
        department: true,
        organization: {
          select: { name: true }
        }
      },
      orderBy: [{ branch: { name: "asc" } }, { name: "asc" }],
    });
  }

  async findOne(id: string, user: any) {
    const isSuperAdmin = user.role === "SUPER";
    const template = await this.prisma.shiftTemplate.findFirst({
      where: isSuperAdmin
        ? { id }
        : { organizationId: user.organizationId, id: id },
      include: {
        branch: true,
        department: true,
      },
    });

    if (!template) {
      throw new NotFoundException("Shift template not found");
    }

    return template;
  }

  async update(id: string, dto: any, user: any) {
    const current = await this.findOne(id, user);

    const organizationId = current.organizationId;
    const branchId = await this.resolveBranch(
      {
        departmentId: dto.departmentId,
        branchId: dto.branchId ?? current.branchId,
      },
      organizationId,
    );

    return this.prisma.shiftTemplate.update({
      where: { id },
      data: {
        ...dto,
        branchId,
      },
      include: {
        branch: true,
        department: true,
      },
    });
  }

  async remove(id: string, user: any) {
    await this.findOne(id, user);

    return this.prisma.shiftTemplate.delete({
      where: { id },
    });
  }
}
