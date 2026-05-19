import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class WorkloadMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any, user: any) {
    return this.prisma.workLoadMetrics.create({
      data: {
        ...dto,
        organizationId: user.organizationId,
      },
    });
  }

  async findAll(query: any, user: any) {
    return this.prisma.workLoadMetrics.findMany({
      where: {
        organizationId: user.organizationId,
        ...(query.nurseId && {
          nurseId: query.nurseId,
        }),
        ...(query.month && {
          month: Number(query.month),
        }),
        ...(query.year && {
          year: Number(query.year),
        }),
      },
      include: {
        nurse: true,
      },
      orderBy: [
        {
          year: "desc",
        },
        {
          month: "desc",
        },
      ],
    });
  }

  async findOne(id: string, user: any) {
    const metric = await this.prisma.workLoadMetrics.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        nurse: true,
      },
    });

    if (!metric) {
      throw new NotFoundException("Workload metric not found");
    }

    return metric;
  }

  async update(id: string, dto: any, user: any) {
    await this.findOne(id, user);
    return this.prisma.workLoadMetrics.update({
      where: {
        id,
      },

      data: dto,
    });
  }
}
