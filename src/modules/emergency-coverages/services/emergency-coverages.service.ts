import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";
import {
  assertBranchInOrganization,
  resolveDepartmentBranch,
} from "@common/utils/branch-scope";

@Injectable()
export class EmergencyCoveragesService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveBranch(dto: any, organizationId: string) {
    if (dto.branchId) {
      await assertBranchInOrganization(
        this.prisma,
        dto.branchId,
        organizationId,
      );
      return dto.branchId as string;
    }

    if (dto.departmentId) {
      return resolveDepartmentBranch(
        this.prisma,
        dto.departmentId,
        organizationId,
      );
    }

    if (dto.shiftId) {
      const shift = await this.prisma.shift.findFirst({
        where: { id: dto.shiftId, organizationId },
        select: {
          branchId: true,
          departmentId: true,
        },
      });

      if (shift?.branchId) return shift.branchId;
      if (shift?.departmentId) {
        return resolveDepartmentBranch(
          this.prisma,
          shift.departmentId,
          organizationId,
        );
      }
    }

    throw new BadRequestException(
      "A branch (sede) could not be resolved for the emergency coverage.",
    );
  }

  async create(dto: any, user: any) {
    const branchId = await this.resolveBranch(dto, user.organizationId);

    return this.prisma.emergencyCoverages.create({
      data: {
        ...dto,
        organizationId: user.organizationId,
        branchId,
      },
      include: {
        branch: true,
        department: true,
        shift: true,
      },
    });
  }

  async findAll(organizationId: string, query: any = {}) {
    return this.prisma.emergencyCoverages.findMany({
      where: {
        organizationId,
        ...(query.branchId && { branchId: query.branchId }),
        ...(query.departmentId && { departmentId: query.departmentId }),
      },

      include: {
        nurse: true,

        shift: true,

        department: true,

        branch: true,

        emergencyCandidates: true,
      },
    });
  }

  async findOne(id: string, user: any) {
    const coverage = await this.prisma.emergencyCoverages.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        branch: true,
        department: true,
        shift: true,
        nurse: true,
      },
    });

    if (!coverage) {
      throw new NotFoundException("Emergency coverage not found");
    }

    return coverage;
  }

  async update(id: string, dto: any, user: any) {
    const current = await this.findOne(id, user);

    let branchId = current.branchId;
    if (dto.branchId || dto.departmentId || dto.shiftId) {
      branchId = await this.resolveBranch(
        {
          branchId: dto.branchId ?? current.branchId,
          departmentId: dto.departmentId,
          shiftId: dto.shiftId,
        },
        user.organizationId,
      );
    }

    return this.prisma.emergencyCoverages.update({
      where: { id },

      data: {
        ...dto,
        branchId,
      },
      include: {
        branch: true,
      },
    });
  }

  async remove(id: string, user: any) {
    await this.findOne(id, user);

    return this.prisma.emergencyCoverages.delete({
      where: { id },
    });
  }
}
