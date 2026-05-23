import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";
import { ConditionResultInterface } from "../interfaces/condition-result.interface";


@Injectable()
export class WorkRuleConditionsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: any) {
    return this.prisma.workRuleConditions.create({
      data: dto,
    });
  }

  async findAll(workRuleId: string) {
    return this.prisma.workRuleConditions.findMany({
      where: {
        workRuleId,
      },

      orderBy: {
        priority: "asc",
      },
    });
  }

  async findOne(id: string) {
    const condition = await this.prisma.workRuleConditions.findUnique({
      where: { id },
    });

    if (!condition) {
      throw new NotFoundException("Condition not found");
    }

    return condition;
  }

  async update(id: string, dto: any) {
    await this.findOne(id);

    return this.prisma.workRuleConditions.update({
      where: { id },

      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.workRuleConditions.delete({
      where: { id },
    });
  }
}
