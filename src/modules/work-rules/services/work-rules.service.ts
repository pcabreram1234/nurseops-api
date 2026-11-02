import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";
import { Prisma } from "@prisma/client";

import { CreateWorkRuleDto } from "../dto/create-work-rule.dto";

import { UpdateWorkRuleDto } from "../dto/update-work-rule.dto";

@Injectable()
export class WorkRulesService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: CreateWorkRuleDto) {
    return this.prisma.workRule.create({
      data: dto,
    });
  }

  async findAll(query: any, user: any) {
    const isSuperAdmin = user.role === "SUPER"
    const where: Prisma.WorkRuleWhereInput = isSuperAdmin
      ? {}
      : { organizationId: user.organizationId };
    
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }
    if (query.code) {
      where.code = query.code;
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { code: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    // const orderBy = { createdAt: "desc" } as Prisma.WorkRuleOrderByWithRelationInput;

    // Paginación opcional
    if (query.page || query.limit) {
      const page = Math.max(1, Number(query.page) || 1);
      const limit = Math.min(500, Math.max(1, Number(query.limit) || 25));
      const [data, total] = await Promise.all([
        this.prisma.workRule.findMany({
          where,
          // orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.workRule.count({ where }),
      ]);
      return {
        data,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    }

    return this.prisma.workRule.findMany({
      where,
      // orderBy,
    });
  }

  async findOne(id: string, user: any) {
    const isSuperAdmin = user.role === "SUPER"
    const rule = await this.prisma.workRule.findUnique({
      where: isSuperAdmin ? { id } : { id, organizationId: user.organizationId },
    });

    if (!rule) {
      throw new NotFoundException("Work rule not found");
    }

    return rule;
  }

  async update(id: string, dto: UpdateWorkRuleDto, user: any) {
    await this.findOne(id, user);

    return this.prisma.workRule.update({
      where: { id },

      data: dto,
    });
  }

  async remove(id: string, user: any) {
    await this.findOne(id, user);
    return this.prisma.workRule.delete({
      where: { id },
    });
  }
}
