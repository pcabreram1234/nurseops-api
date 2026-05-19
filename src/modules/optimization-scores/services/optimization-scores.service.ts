import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class OptimizationScoresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any, user: any) {
    return this.prisma.optimizationScore.create({
      data: {
        ...dto,
        organizationId: user.organizationId,
      },
    });
  }

  async findAll(query: any, user: any) {
    return this.prisma.optimizationScore.findMany({
      where: {
        organizationId: user.organizationId,
        ...(query.nurseId && {
          nurseId: query.nurseId,
        }),
      },
      include: {
        nurse: true,
      },
      orderBy: {
        overall_score: "desc",
      },
    });
  }

  async findOne(id: string, user: any) {
    const score = await this.prisma.optimizationScore.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
    });

    if (!score) {
      throw new NotFoundException("Optimization score not found");
    }

    return score;
  }

  async update(id: string, dto: any, user: any) {
    await this.findOne(id, user);

    return this.prisma.optimizationScore.update({
      where: {
        id,
      },
      data: dto,
    });
  }
}
