import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class WorkRuleActionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.workRuleActions.create({
      data: dto,
    });
  }

  async findAll(workRuleId: string) {
    return this.prisma.workRuleActions.findMany({
      where: {
        workRuleId,
      },

      orderBy: {
        priority: "asc",
      },
    });
  }

  async findOne(id: string) {
    const action = await this.prisma.workRuleActions.findUnique({
      where: { id },
    });

    if (!action) {
      throw new NotFoundException("Action not found");
    }

    return action;
  }

  async update(id: string, dto: any) {
    return this.prisma.workRuleActions.update({
      where: { id },

      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.workRuleActions.delete({
      where: { id },
    });
  }
}
