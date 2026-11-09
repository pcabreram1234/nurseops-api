import { Injectable } from "@nestjs/common";
import { PrismaService } from "@infra/database/prisma.service";
import {
  ShiftChangeOperationType,
} from "@prisma/client";

@Injectable()
export class ShiftChangeRiskService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calcula un puntaje de riesgo (0-100) para una solicitud de cambio de turno.
   * Considera: tipo de operación, turno nocturno, carga laboral, descanso, cobertura.
   */
  async calculateRisk(payload: any) {
    const {
      operationType = ShiftChangeOperationType.SWAP,
      sourceScheduleEntryId,
      targetScheduleEntryId,
      requesterId,
      receiverId,
      organizationId,
    } = payload;

    let riskScore = 0;
    const factors: string[] = [];

    // Factor 1: Tipo de operación
    if (operationType === ShiftChangeOperationType.COVERAGE) {
      riskScore += 15;
      factors.push("operación de cobertura");
    } else if (operationType === ShiftChangeOperationType.TRANSFER) {
      riskScore += 10;
      factors.push("cesión de turno");
    } else {
      riskScore += 5;
      factors.push("intercambio");
    }

    // Factor 2: Turno nocturno (mayor riesgo)
    if (sourceScheduleEntryId) {
      const sourceEntry = await this.prisma.scheduleEntry.findUnique({
        where: { id: sourceScheduleEntryId },
        include: { shift: true },
      });
      if (sourceEntry?.shift?.isNightShift) {
        riskScore += 20;
        factors.push("turno nocturno");
      }
    }

    if (targetScheduleEntryId) {
      const targetEntry = await this.prisma.scheduleEntry.findUnique({
        where: { id: targetScheduleEntryId },
        include: { shift: true },
      });
      if (targetEntry?.shift?.isNightShift) {
        riskScore += 10;
        factors.push("turno nocturno destino");
      }
    }

    // Factor 3: Carga laboral del requester
    if (requesterId) {
      const nurse = await this.prisma.nurse.findUnique({
        where: { userId: requesterId },
        select: { id: true },
      });
      if (nurse) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const entries = await this.prisma.scheduleEntry.findMany({
          where: {
            nurseId: nurse.id,
            date: { gte: startOfMonth, lte: now },
            status: { in: ["ASSIGNED", "CONFIRMED"] },
          },
          include: { shift: { select: { durationHours: true } } },
        });
        const totalHours = entries.reduce(
          (sum, e) => sum + Number(e.shift?.durationHours || 0),
          0,
        );
        if (totalHours > 140) {
          riskScore += 20;
          factors.push("carga laboral alta del solicitante");
        } else if (totalHours > 100) {
          riskScore += 10;
          factors.push("carga laboral moderada del solicitante");
        }
      }
    }

    // Factor 4: Receiver con carga laboral alta (para SWAP/TRANSFER)
    if (receiverId && operationType !== ShiftChangeOperationType.COVERAGE) {
      const nurse = await this.prisma.nurse.findUnique({
        where: { userId: receiverId },
        select: { id: true },
      });
      if (nurse) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const entries = await this.prisma.scheduleEntry.findMany({
          where: {
            nurseId: nurse.id,
            date: { gte: startOfMonth, lte: now },
            status: { in: ["ASSIGNED", "CONFIRMED"] },
          },
          include: { shift: { select: { durationHours: true } } },
        });
        const totalHours = entries.reduce(
          (sum, e) => sum + Number(e.shift?.durationHours || 0),
          0,
        );
        if (totalHours > 140) {
          riskScore += 15;
          factors.push("carga laboral alta del receptor");
        } else if (totalHours > 100) {
          riskScore += 8;
          factors.push("carga laboral moderada del receptor");
        }
      }
    }

    // Normalizar a 0-100
    riskScore = Math.min(100, riskScore);

    let riskLevel: "BAJO" | "MEDIO" | "ALTO" | "CRÍTICO";
    if (riskScore >= 70) riskLevel = "CRÍTICO";
    else if (riskScore >= 50) riskLevel = "ALTO";
    else if (riskScore >= 30) riskLevel = "MEDIO";
    else riskLevel = "BAJO";

    return {
      riskScore,
      riskLevel,
      factors,
    };
  }
}
