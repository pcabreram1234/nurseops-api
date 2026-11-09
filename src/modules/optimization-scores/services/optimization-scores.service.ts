import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";
import { CreateOptimizationScoreDto } from "../dto/create-optimization-score.dto";
import { UpdateOptimizationScoreDto } from "../dto/update-optimization-score.dto";
import { OptimizationScoreFilterDto } from "../dto/optimization-score-filter.dto";

export interface UserOrgContext {
  organizationId?: string;
  role?: string;
}

@Injectable()
export class OptimizationScoresService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(query: OptimizationScoreFilterDto, userOrg?: UserOrgContext) {
    const where: any = {
      ...(query.nurseId && { nurseId: query.nurseId }),
    };

    // Aislamiento por organización: usuarios no-SUPER ni SYSTEM_ADMIN solo ven scores de su organización
    if (userOrg && userOrg.role !== 'SUPER') {
      if (userOrg.organizationId) {
        where.organizationId = userOrg.organizationId;
      }
    }

    return where;
  }

  async create(dto: CreateOptimizationScoreDto, userOrg: UserOrgContext) {
    const organizationId = userOrg.organizationId;
    if (!organizationId) {
      throw new NotFoundException("Usuario sin organización asociada");
    }
    return this.prisma.optimizationScore.create({
      data: {
        ...dto,
        organizationId,
      },
    });
  }

  async findAll(query: OptimizationScoreFilterDto, userOrg?: UserOrgContext) {
    const where = this.buildWhere(query, userOrg);

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

  async findOne(id: string, userOrg?: UserOrgContext) {
    const where: any = { id };

    // Aislamiento: usuarios no-SUPER ni SYSTEM_ADMIN solo pueden acceder a scores de su organización
    if (userOrg && userOrg.role !== 'SUPER') {
      if (userOrg.organizationId) {
        where.organizationId = userOrg.organizationId;
      }
    }

    const score = await this.prisma.optimizationScore.findFirst({
      where,
      include: { nurse: true },
    });

    if (!score) {
      throw new NotFoundException("Optimization score not found");
    }

    return score;
  }

  async update(id: string, dto: UpdateOptimizationScoreDto, userOrg?: UserOrgContext) {
    await this.findOne(id, userOrg);

    return this.prisma.optimizationScore.update({
      where: { id },
      data: dto,
    });
  }
}
