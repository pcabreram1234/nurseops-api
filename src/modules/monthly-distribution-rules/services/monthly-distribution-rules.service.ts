import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class MonthlyDistributionRulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.monthlyDistributionRule.create({
      data: dto,
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.monthlyDistributionRule.findMany({
      where: {
        organizationId,
      },
    });
  }

  async findOne(id: string) {
    const rule = await this.prisma.monthlyDistributionRule.findUnique({
      where: { id },
    });

    if (!rule) {
      throw new NotFoundException("Distribution rule not found");
    }

    return rule;
  }

  async update(id: string, dto: any) {
    await this.findOne(id);

    return this.prisma.monthlyDistributionRule.update({
      where: { id },

      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.monthlyDistributionRule.delete({
      where: { id },
    });
  }
}
