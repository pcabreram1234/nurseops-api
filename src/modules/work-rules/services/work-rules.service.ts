import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

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

  async findAll(organizationId: string, user: any) {
    const isSuperAdmin = user.role === "SUPER"
    return this.prisma.workRule.findMany({
      where: isSuperAdmin ? {} : {
        organizationId,
      },
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
