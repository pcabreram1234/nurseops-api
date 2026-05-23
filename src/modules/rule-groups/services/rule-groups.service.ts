import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class RuleGroupsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: any) {
    return this.prisma.ruleGroup.create({
      data: dto,
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.ruleGroup.findMany({
      where: {
        organizationId,
      },

      include: {
        assignments: {
          include: {
            workRules: true,
          },
        },
      },
    });
  }

  async findOne(id: string, user: any) {
    const isSuperAdmin = user.role === "SUPER"
    const group = await this.prisma.ruleGroup.findFirst({
      where: isSuperAdmin ? { id: id } : { organizationId: user.organizationId },
      include: {
        assignments: {
          include: {
            workRules: true,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException("Rule group not found");
    }

    return group;
  }

  async update(id: string, dto: any, user: any) {
    await this.findOne(id, user);

    return this.prisma.ruleGroup.update({
      where: { id },

      data: dto,
    });
  }

  async remove(id: string, user: any) {
    await this.findOne(id, user);

    return this.prisma.ruleGroup.delete({
      where: { id },
    });
  }
}
