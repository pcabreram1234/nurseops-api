import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";
import { assertBranchInOrganization } from "@common/utils/branch-scope";

@Injectable()
export class LeavesService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveBranchForUser(
    userId: string,
    organizationId: string,
    requestedBranchId?: string,
  ): Promise<string | null> {
    if (requestedBranchId) {
      await assertBranchInOrganization(
        this.prisma,
        requestedBranchId,
        organizationId,
      );
      return requestedBranchId;
    }

    const employee = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        branchId: true,
        department: {
          select: {
            branches: {
              where: { isPrimary: true },
              select: { branchId: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!employee) {
      throw new BadRequestException("The selected user does not exist.");
    }

    return (
      employee.branchId ??
      employee.department?.branches?.[0]?.branchId ??
      null
    );
  }

  async create(dto: any, user: any) {
    const { branchId: requestedBranchId, ...rest } = dto;

    const employee = await this.prisma.user.findFirst({
      where: {
        id: dto.userId,
        organizationId: user.organizationId,
      },
      select: { id: true, departmentId: true },
    });

    if (!employee) {
      throw new BadRequestException(
        "The selected user does not belong to your organization.",
      );
    }

    if (!employee.departmentId) {
      throw new BadRequestException(
        "The selected user does not have a department assigned.",
      );
    }

    const branchId = await this.resolveBranchForUser(
      dto.userId,
      user.organizationId,
      requestedBranchId,
    );

    return this.prisma.leave.create({
      data: {
        ...rest,
        organiztionId: user.organizationId,
        departmentId: employee.departmentId,
        ...(branchId ? { branchId } : {}),
      },
      include: {
        user: { include: { branch: true } },
        approvedBy: true,
        department: true,
        branch: true,
      },
    });
  }

  async findAll(query: any, user: any) {
    return this.prisma.leave.findMany({
      where: {
        organiztionId: user.organizationId,
        ...(query.userId && {
          userId: query.userId,
        }),
        ...(query.branchId && {
          branchId: query.branchId,
        }),
        ...(query.departmentId && {
          departmentId: query.departmentId,
        }),
        ...(query.type && {
          type: query.type,
        }),
        ...(query.status && {
          status: query.status,
        }),
        ...(query.startDate &&
          query.endDate && {
            startDate: {
              gte: new Date(query.startDate),

              lte: new Date(query.endDate),
            },
          }),
      },

      include: {
        user: { include: { branch: true } },
        approvedBy: true,
        department: true,
        branch: true,
      },
      orderBy: {
        startDate: "asc",
      },
    });
  }

  async findOne(id: string, user: any) {
    const leave = await this.prisma.leave.findFirst({
      where: {
        id,
        organiztionId: user.organizationId,
      },
      include: {
        user: { include: { branch: true } },
        approvedBy: true,
        department: true,
        branch: true,
      },
    });

    if (!leave) {
      throw new NotFoundException("Leave not found");
    }

    return leave;
  }

  async update(id: string, dto: any, user: any) {
    await this.findOne(id, user);

    if (dto.branchId) {
      await assertBranchInOrganization(
        this.prisma,
        dto.branchId,
        user.organizationId,
      );
    }

    return this.prisma.leave.update({
      where: {
        id,
      },

      data: dto,
      include: { branch: true },
    });
  }
}
