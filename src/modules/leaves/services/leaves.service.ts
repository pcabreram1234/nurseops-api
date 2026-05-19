import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class LeavesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any, user: any) {
    return this.prisma.leave.create({
      data: {
        ...dto,
        organizationId: user.organizationId,
      },
    });
  }

  async findAll(query: any, user: any) {
    return this.prisma.leave.findMany({
      where: {
        organizationId: user.organizationId,
        ...(query.userId && {
          userId: query.userId,
          ...(query.type && {}),
          type: query.type,
          ...(query.status && {}),
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
        user: true,
        approvedBy: true,
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
        organizationId: user.organizationId,
      },
      include: {
        user: true,
        approvedBy: true,
      },
    });

    if (!leave) {
      throw new NotFoundException("Leave not found");
    }

    return leave;
  }

  async update(id: string, dto: any, user: any) {
    await this.findOne(id, user);
    return this.prisma.leave.update({
      where: {
        id,
      },

      data: dto,
    });
  }
}
