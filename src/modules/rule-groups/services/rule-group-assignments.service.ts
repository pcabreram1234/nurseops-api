import { Injectable } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

@Injectable()
export class RuleGroupAssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async assignRule(
    ruleGroupId: string,

    dto: any,
  ) {
    return this.prisma.ruleGroupAssigment.create({
      data: {
        ruleGroupId,

        workRuleId: dto.workRuleId,

        priority: dto.priority || 1,
      },
    });
  }

  async removeAssignment(id: string) {
    return this.prisma.ruleGroupAssigment.delete({
      where: { id },
    });
  }
}
