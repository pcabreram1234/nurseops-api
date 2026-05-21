import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaClient } from '@prisma/client';
import { ApprovalStatus } from '../enums/approval-status.enum';

@Injectable()
export class ExpireApprovalsJob {
  private readonly logger = new Logger(ExpireApprovalsJob.name);

  constructor(private readonly prisma: PrismaClient) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.log('Initiating automatic verification of approval expirations...');
    
    const now = new Date();
    const result = await this.prisma.shiftChangeApprovals.updateMany({
      where: {
        status: ApprovalStatus.PENDING,
        expiresAt: { lt: now },
      },
      data: {
        status: ApprovalStatus.EXPIRED,
      },
    });

    if (result.count > 0) {
      this.logger.warn(`They have expired automatically ${result.count} shift change requests.`);
    }
  }
}