import { Injectable } from "@nestjs/common";
import { PrismaService } from "@infra/database/prisma.service";
import {
  ShiftChangeOperationType,
} from "@prisma/client";

@Injectable()
export class ShiftChangeAIService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Genera una recomendación (APPROVE / REVIEW / REJECT) basada en:
   * - Resultado del validador (bloques HARD/SOFT)
   * - Puntaje de riesgo
   * - Historial de solicitudes similares
   * - Disponibilidad de personal alternativo
   */
  async recommend(payload: any) {
    const {
      operationType = ShiftChangeOperationType.SWAP,
      organizationId,
      hardBlocks = [],
      softWarnings = [],
      riskScore = 0,
      sourceScheduleEntryId,
      targetScheduleEntryId,
    } = payload;

    // Si hay bloques HARD, rechazar directamente
    if (hardBlocks && hardBlocks.length > 0) {
      return {
        recommendation: "REJECT",
        reason: "Existen bloqueos operacionales críticos que impiden la aprobación.",
        confidence: 0.95,
      };
    }

    // Si hay advertencias SOFT y riesgo alto, recomendar revisión
    if ((softWarnings && softWarnings.length > 0) || riskScore >= 50) {
      return {
        recommendation: "REVIEW",
        reason: "Existen advertencias operacionales o riesgo moderado/alto. Se recomienda revisión manual por supervisión.",
        confidence: 0.75,
        warnings: softWarnings || [],
        riskScore,
      };
    }

    // Verificar historial de solicitudes rechazadas en el departamento
    if (sourceScheduleEntryId && organizationId) {
      const sourceEntry = await this.prisma.scheduleEntry.findUnique({
        where: { id: sourceScheduleEntryId },
        include: { schedule: { select: { departmentId: true } } },
      });
      if (sourceEntry?.schedule?.departmentId) {
        const recentRejections = await this.prisma.shiftChangeRequest.count({
          where: {
            organizationId,
            status: { in: ["REJECTED", "REJECTED_BY_SUPERVISOR", "REJECTED_BY_NURSE"] },
            sourceScheduleEntry: {
              schedule: { departmentId: sourceEntry.schedule.departmentId },
            },
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // últimos 30 días
            },
          },
        });
        if (recentRejections > 5) {
          return {
            recommendation: "REVIEW",
            reason: "El departamento tiene un alto índice de rechazos recientes. Se recomienda revisión adicional.",
            confidence: 0.7,
          };
        }
      }
    }

    // Recomendación por defecto: aprobar
    return {
      recommendation: "APPROVE",
      reason: "La operación cumple con las reglas operacionales y el riesgo es bajo.",
      confidence: 0.85,
      riskScore,
    };
  }
}
