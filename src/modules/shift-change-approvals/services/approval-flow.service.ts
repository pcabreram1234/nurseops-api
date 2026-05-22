import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';
import { ApprovalLevel } from '../enums/approval-level.enum';

@Injectable()
export class ApprovalFlowService {
  constructor(private readonly prisma: PrismaService) { }

  async determineRequiredLevel(departmentId: string): Promise<ApprovalLevel> {
    // Lógica dinámica: Si el departamento es crítico (ej: Quirófano o UCI), escala a Head of Dept.
    const dept = await this.prisma.department.findUnique({ where: { id: departmentId } });
    if (dept?.name?.toUpperCase().includes('UCI') || dept?.name?.toUpperCase().includes('QUIROFANO')) {
      return ApprovalLevel.DEPARTMENT_HEAD;
    }
    return ApprovalLevel.SUPERVISOR;
  }
}