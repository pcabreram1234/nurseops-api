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
    const where = {
      organizationId: user.organizationId,
      ...(query.nurseId && {
        nurseId: query.nurseId,
      }),
    };

    const include = {
      nurse: true,
    };

    const orderBy = { overall_score: "desc" as const };

    // Paginación opcional
    if (query.page || query.limit) {
      const page = Math.max(1, Number(query.page) || 1);
      const limit = Math.min(500, Math.max(1, Number(query.limit) || 25));
      const [data, total] = await Promise.all([
        this.prisma.optimizationScore.findMany({
          where,
          include,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.optimizationScore.count({ where }),
      ]);
      return {
        data,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    }

    return this.prisma.optimizationScore.findMany({
      where,
      include,
      orderBy,
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
