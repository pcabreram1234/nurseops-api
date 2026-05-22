import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@infra/database/prisma.service';
import { ApprovalStatus } from '../enums/approval-status.enum';

@Injectable()
export class RemindPendingApprovalsJob {
  private readonly logger = new Logger(RemindPendingApprovalsJob.name);

  constructor(private readonly prisma: PrismaService) { }

  @Cron(CronExpression.EVERY_DAY_AT_8AM) // Corre todas las mañanas a las 8 AM
  async handleCron() {
    // this.logger.log('Searching for stuck requests to send reminders...');
    // const pendingCount = await this.prisma.shiftChangeApprovals.count({
    //   where: { status: ApprovalStatus.PENDING },
    // });
    // this.logger.log(`There are ${pendingCount} shift requests awaiting supervisory response.`);
  }
}