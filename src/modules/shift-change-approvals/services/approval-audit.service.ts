import { Injectable } from '@nestjs/common';
import { PrismaClient, ActionAuditLogTypes} from '@prisma/client'; // Ajusta la ruta a tu PrismaService


@Injectable()
export class ApprovalAuditService {
  constructor(private readonly prisma: PrismaClient) {}

  async logAction(approvalId: string, userId: string, action: ActionAuditLogTypes, metadata: any) {
    // Si tienes tabla dedicada o usas tu AuditLog generalizado:
    await this.prisma.auditLog.create({
      data: {
        userId,
        action,
        moduleId: 'SHIFT_CHANGE_APPROVALS',
        new_value: metadata,
        old_value: {},
      },
    });
  }
}