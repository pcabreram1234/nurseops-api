import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

import { CreateWorkRuleDto } from "../dto/create-work-rule.dto";

import { UpdateWorkRuleDto } from "../dto/update-work-rule.dto";

@Injectable()
export class WorkRulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWorkRuleDto) {
    return this.prisma.workRules.create({
      data: dto,
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.workRules.findMany({
      where: {
        organizationId,
      },
    });
  }

  async findOne(id: string) {
    const rule = await this.prisma.workRules.findUnique({
      where: { id },
    });

    if (!rule) {
      throw new NotFoundException("Work rule not found");
    }

    return rule;
  }

  async update(id: string, dto: UpdateWorkRuleDto) {
    await this.findOne(id);

    return this.prisma.workRules.update({
      where: { id },

      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.workRules.delete({
      where: { id },
    });
  }
}
