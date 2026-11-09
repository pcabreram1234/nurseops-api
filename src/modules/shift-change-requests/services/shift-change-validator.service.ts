import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "@infra/database/prisma.service";
import {
  ShiftChangeOperationType,
  RequestStatus,
  ScheduleEntryStatus,
  NurseAvailabilityStatusType,
  AbsenceStatus,
  VacationStatus,
} from "@prisma/client";

export interface ValidationContext {
  requesterId: string;
  receiverId?: string | null;
  sourceScheduleEntryId: string;
  targetScheduleEntryId?: string | null;
  operationType: ShiftChangeOperationType;
  organizationId: string;
}

export interface ValidationRuleResult {
  rule: string;
  type: "HARD" | "SOFT";
  valid: boolean;
  message?: string;
}

export interface ShiftChangeValidationResult {
  valid: boolean;
  canProceed: boolean;
  hardBlocks: ValidationRuleResult[];
  softWarnings: ValidationRuleResult[];
  coverageBefore?: any;
  coverageAfter?: any;
  evaluatedAt: Date;
}

const TERMINAL_STATUSES = [
  RequestStatus.REJECTED,
  RequestStatus.CANCELLED,
  RequestStatus.EXPIRED,
  RequestStatus.COMPLETED,
  RequestStatus.ROLLED_BACK,
] as RequestStatus[];

@Injectable()
export class ShiftChangeValidatorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Valida una solicitud de cambio de turno de forma centralizada.
   * Evalúa disponibilidad, descanso, carga laboral, especialidad, cobertura y reglas organizacionales.
   */
  async validate(
    context: ValidationContext,
  ): Promise<ShiftChangeValidationResult> {
    const {
      requesterId,
      receiverId,
      sourceScheduleEntryId,
      targetScheduleEntryId,
      operationType,
      organizationId,
    } = context;

    const hardBlocks: ValidationRuleResult[] = [];
    const softWarnings: ValidationRuleResult[] = [];

    // 1. Obtener las asignaciones de turno involucradas
    const [sourceEntry, targetEntry] = await Promise.all([
      this.prisma.scheduleEntry.findUnique({
        where: { id: sourceScheduleEntryId },
        include: {
          shift: true,
          shiftTemplate: { include: { department: true } },
          nurse: { include: { user: true, department: true } },
          schedule: true,
          branch: true,
        },
      }),
      targetScheduleEntryId
        ? this.prisma.scheduleEntry.findUnique({
            where: { id: targetScheduleEntryId },
            include: {
              shift: true,
              shiftTemplate: { include: { department: true } },
              nurse: { include: { user: true, department: true } },
              schedule: true,
              branch: true,
            },
          })
        : Promise.resolve(null),
    ]);

    if (!sourceEntry) {
      throw new NotFoundException(
        "La asignación de turno de origen no existe.",
      );
    }

    // Multi-tenant: verificar organización
    if (sourceEntry.organizationId !== organizationId) {
      throw new ForbiddenException(
        "La asignación de turno no pertenece a su organización.",
      );
    }

    // 2. Obtener el nurse del requester
    const requesterNurse = await this.prisma.nurse.findUnique({
      where: { userId: requesterId },
      select: { id: true, userId: true, departmentId: true, organizationId: true },
    });

    if (!requesterNurse) {
      throw new NotFoundException("Enfermera solicitante no encontrada.");
    }

    // 3. Validar estado del turno de origen (puede modificarse)
    const modifiableStatuses = ["ASSIGNED", "CONFIRMED", "PENDING"] as ScheduleEntryStatus[];
    if (!modifiableStatuses.includes(sourceEntry.status)) {
      hardBlocks.push({
        rule: "ENTRY_STATUS",
        type: "HARD",
        valid: false,
        message: `El turno de origen no puede modificarse porque su estado es "${sourceEntry.status}".`,
      });
    }

    // 4. Verificar que no haya otra operación aprobada o completada sobre el mismo entry
    const conflictingRequests = await this.prisma.shiftChangeRequest.findMany({
      where: {
        OR: [
          {
            sourceScheduleEntryId,
            status: { notIn: TERMINAL_STATUSES },
          },
          ...(targetScheduleEntryId
            ? [
                {
                  targetScheduleEntryId,
                  status: { notIn: TERMINAL_STATUSES },
                },
              ]
            : []),
        ],
      },
    });

    const hasApprovedConflict = conflictingRequests.some(
      (r) =>
        r.status === RequestStatus.APPROVED_BY_SUPERVISOR ||
        r.status === RequestStatus.COMPLETED,
    );

    if (hasApprovedConflict) {
      hardBlocks.push({
        rule: "ENTRY_CONFLICT",
        type: "HARD",
        valid: false,
        message:
          "Una de las asignaciones ya está involucrada en otra operación aprobada o completada.",
      });
    }

    // 5. Validar disponibilidad del receiver para el sourceEntry (si hay receiver)
    if (receiverId) {
      const receiverNurse = await this.prisma.nurse.findUnique({
        where: { userId: receiverId },
        select: { id: true, userId: true, departmentId: true, organizationId: true },
      });

      if (!receiverNurse) {
        throw new NotFoundException("Enfermera receptora no encontrada.");
      }

      if (receiverNurse.organizationId !== organizationId) {
        throw new ForbiddenException(
          "La enfermera receptora no pertenece a su organización.",
        );
      }

      // Validar que el receiver pueda tomar el sourceEntry
      const sourceValidation =
        await this.validateNurseAvailability(
          receiverNurse.id,
          sourceEntry.shiftId,
          sourceEntry.date,
          sourceEntry.id,
          sourceEntry.shiftTemplate?.department?.id,
        );

      if (!sourceValidation.canAssign) {
        for (const error of sourceValidation.errors) {
          hardBlocks.push({
            rule: "RECEIVER_AVAILABILITY",
            type: "HARD",
            valid: false,
            message: error,
          });
        }
      }
      for (const warning of sourceValidation.warnings) {
        softWarnings.push({
          rule: "RECEIVER_AVAILABILITY",
          type: "SOFT",
          valid: true,
          message: warning,
        });
      }

      // Para SWAP: validar que el requester pueda tomar el targetEntry
      if (
        operationType === ShiftChangeOperationType.SWAP &&
        targetEntry
      ) {
        const targetValidation =
          await this.validateNurseAvailability(
            requesterNurse.id,
            targetEntry.shiftId,
            targetEntry.date,
            targetEntry.id,
            targetEntry.shiftTemplate.department?.id,
          );

        if (!targetValidation.canAssign) {
          for (const error of targetValidation.errors) {
            hardBlocks.push({
              rule: "REQUESTER_AVAILABILITY",
              type: "HARD",
              valid: false,
              message: error,
            });
          }
        }
        for (const warning of targetValidation.warnings) {
          softWarnings.push({
            rule: "REQUESTER_AVAILABILITY",
            type: "SOFT",
            valid: true,
            message: warning,
          });
        }
      }
    }

    // 6. Calcular cobertura antes y después
    const coverageBefore = await this.calculateCoverage(
      sourceEntry.schedule.departmentId,
      sourceEntry.schedule.branchId,
      sourceEntry.date,
    );

    let coverageAfter = { ...coverageBefore };

    if (
      operationType === ShiftChangeOperationType.SWAP &&
      targetEntry &&
      sourceEntry.shiftTemplate?.departmentId !==
        targetEntry.shiftTemplate?.departmentId
    ) {
      coverageAfter = await this.calculateCoverage(
        sourceEntry.schedule.departmentId,
        sourceEntry.schedule.branchId,
        sourceEntry.date,
      );
    }

    // 7. Evaluar reglas de descanso y carga laboral para cada enfermera involucrada
    const nursesToEvaluate: string[] = [requesterNurse.id];
    if (receiverId) {
      const receiverNurseRecord = await this.prisma.nurse.findUnique({
        where: { userId: receiverId },
        select: { id: true },
      });
      if (receiverNurseRecord) {
        nursesToEvaluate.push(receiverNurseRecord.id);
      }
    }

    for (const nurseId of nursesToEvaluate) {
      const restBlocks = await this.validateRestAndWorkload(
        nurseId,
        sourceEntry.shiftId,
        sourceEntry.date,
        organizationId,
      );

      for (const error of restBlocks.errors) {
        hardBlocks.push({
          rule: "REST_AND_WORKLOAD",
          type: "HARD",
          valid: false,
          message: error,
        });
      }
      for (const warning of restBlocks.warnings) {
        softWarnings.push({
          rule: "REST_AND_WORKLOAD",
          type: "SOFT",
          valid: true,
          message: warning,
        });
      }
    }

    // 8. Evaluar reglas de especialidad y competencias
    const specialityBlocks = await this.validateSpecialties(
      requesterNurse.id,
      receiverId,
      sourceEntry,
      targetEntry,
      operationType,
    );

    for (const block of specialityBlocks.hardBlocks) {
      hardBlocks.push(block);
    }
    for (const warning of specialityBlocks.softWarnings) {
      softWarnings.push(warning);
    }

    // 9. Evaluar reglas organizacionales (departamento, sede, contrato)
    const orgBlocks = await this.validateOrganizationalRules(
      requesterNurse.id,
      receiverId ? await this.prisma.nurse.findUnique({
        where: { userId: receiverId },
        select: { id: true },
      }) : null,
      sourceEntry,
      targetEntry,
      operationType,
      organizationId,
    );

    for (const block of orgBlocks.hardBlocks) {
      hardBlocks.push(block);
    }
    for (const warning of orgBlocks.softWarnings) {
      softWarnings.push(warning);
    }

    const canProceed = hardBlocks.length === 0;

    return {
      valid: canProceed,
      canProceed,
      hardBlocks,
      softWarnings,
      coverageBefore,
      coverageAfter,
      evaluatedAt: new Date(),
    };
  }

  /**
   * Valida disponibilidad de una enfermera para un turno específico
   * Verifica vacaciones, ausencias, permisos, disponibilidad horaria y solapamiento.
   */
  private async validateNurseAvailability(
    nurseId: string,
    shiftId: string,
    date: Date,
    entryId?: string,
    targetDepartmentId?: string,
  ): Promise<{ canAssign: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Obtener información del turno
    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId },
    });

    if (!shift) {
      return { canAssign: false, errors: ["Turno no encontrado"], warnings: [] };
    }

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Verificar vacaciones aprobadas
    const isOnVacation = await this.prisma.absence.findFirst({
      where: {
        nurseId,
        type: "VACATION",
        status: "APPROVED",
        OR: [
          { date: { lte: dayEnd }, endDate: { gte: dayStart } },
        ],
      },
    });

    if (isOnVacation) {
      errors.push("La enfermera está de vacaciones aprobadas en esta fecha.");
    }

    // Verificar licencias aprobadas
    const hasLeave = await this.prisma.leave.findFirst({
      where: {
        userId: nurseId,
        status: "APPROVED",
        OR: [
          { startDate: { lte: dayEnd }, endDate: { gte: dayStart } },
        ],
      },
    });

    if (hasLeave) {
      errors.push("La enfermera tiene una licencia o permiso aprobado en esta fecha.");
    }

    // Verificar disponibilidad horaria
    const availability = await this.prisma.nurseAvailability.findFirst({
      where: {
        nurseId,
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    if (availability && availability.status === "NOT_AVAILABLE") {
      errors.push("La enfermera no está disponible en esta fecha.");
    } else if (availability && availability.status === "PARTIAL") {
      warnings.push("La enfermera tiene disponibilidad parcial en esta fecha.");
    }

    // Verificar solapamiento con otros turnos
    const existingEntries = await this.prisma.scheduleEntry.findMany({
      where: {
        nurseId,
        date: { gte: dayStart, lte: dayEnd },
        id: entryId ? { not: entryId } : undefined,
        status: { in: ["ASSIGNED", "CONFIRMED", "PENDING"] },
      },
      include: {
        shift: true,
      },
    });

    for (const entry of existingEntries) {
      if (!entry.shift) continue;

      const existingStart = new Date(entry.date);
      existingStart.setHours(
        entry.shift.startTime.getHours(),
        entry.shift.startTime.getMinutes(),
      );

      let existingEnd = new Date(entry.date);
      existingEnd.setHours(
        entry.shift.endTime.getHours(),
        entry.shift.endTime.getMinutes(),
      );

      if (existingEnd <= existingStart) {
        existingEnd.setDate(existingEnd.getDate() + 1);
      }

      const candidateStart = new Date(date);
      candidateStart.setHours(
        shift.startTime.getHours(),
        shift.startTime.getMinutes(),
      );

      let candidateEnd = new Date(date);
      candidateEnd.setHours(
        shift.endTime.getHours(),
        shift.endTime.getMinutes(),
      );

      if (candidateEnd <= candidateStart) {
        candidateEnd.setDate(candidateEnd.getDate() + 1);
      }

      const blocksOverlap = candidateStart < existingEnd && candidateEnd > existingStart;

      if (blocksOverlap) {
        errors.push(
          `La enfermera ya tiene un turno asignado (${entry.shift.name}) que se solapa con este horario.`
        );
        break;
      }
    }

    return {
      canAssign: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Valida descanso mínimo y carga laboral para una enfermera
   */
  private async validateRestAndWorkload(
    nurseId: string,
    shiftId: string,
    date: Date,
    organizationId: string,
  ): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId },
    });

    if (!shift) {
      return { errors: [], warnings: [] };
    }

    // Obtener turnos históricos de la enfermera para calcular descanso y carga
    const startOfMonth = new Date(date);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(date);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const historicalEntries = await this.prisma.scheduleEntry.findMany({
      where: {
        nurseId,
        date: { gte: startOfMonth, lte: endOfMonth },
        status: { in: ["ASSIGNED", "CONFIRMED"] },
      },
      include: {
        shift: true,
      },
      orderBy: { date: "asc" },
    });

    const TWELVE_HOURS_IN_MS = 12 * 60 * 60 * 1000;

    const [startH, startM] = shift.startTime.toISOString().split("T")[1].split(":");
    const candidateStart = new Date(date);
    candidateStart.setHours(Number(startH), Number(startM), 0);

    const [endH, endM] = shift.endTime.toISOString().split("T")[1].split(":");
    let candidateEnd = new Date(date);
    candidateEnd.setHours(Number(endH), Number(endM), 0);
    if (candidateEnd <= candidateStart) {
      candidateEnd.setDate(candidateEnd.getDate() + 1);
    }

    // Validar descanso mínimo (12 horas) entre turnos
    for (const entry of historicalEntries) {
      if (!entry.shift) continue;

      const entryStart = new Date(entry.date);
      entryStart.setHours(
        entry.shift.startTime.getHours(),
        entry.shift.startTime.getMinutes(),
      );

      let entryEnd = new Date(entry.date);
      entryEnd.setHours(
        entry.shift.endTime.getHours(),
        entry.shift.endTime.getMinutes(),
      );

      if (entryEnd <= entryStart) {
        entryEnd.setDate(entryEnd.getDate() + 1);
      }

      // Caso A: El turno existente fue ANTES del propuesto
      if (candidateStart >= entryEnd) {
        if ((candidateStart.getTime() - entryEnd.getTime()) < TWELVE_HOURS_IN_MS) {
          errors.push(`Descanso insuficiente (menos de 12 horas) entre el turno ${entry.shift.name} y el nuevo turno.`);
        }
      }

      // Caso B: El turno existente es DESPUÉS del propuesto
      if (entryStart >= candidateEnd) {
        if (entryStart.getTime() - candidateEnd.getTime() < TWELVE_HOURS_IN_MS) {
          errors.push(`Descanso insuficiente (menos de 12 horas) entre el nuevo turno y el turno ${entry.shift.name}.`);
        }
      }
    }

    // Calcular horas acumuladas en el mes
    let totalHours = 0;
    let consecutiveNights = 0;

    for (const entry of historicalEntries) {
      if (!entry.shift) continue;
      totalHours += entry.shift.durationHours || 0;

      if (entry.shift.isNightShift) {
        consecutiveNights++;
      } else {
        consecutiveNights = 0;
      }
    }

    // Agregar el turno candidato
    totalHours += shift.durationHours || 0;

    // Validar horas mensuales (160 horas límite)
    if (totalHours > 160) {
      errors.push(`La enfermera excedería el límite mensual de horas (${totalHours}h > 160h).`);
    } else if (totalHours > 140) {
      warnings.push(`La enfermera se acerca al límite mensual de horas (${totalHours}h).`);
    }

    // Validar noches consecutivas (máximo 3)
    if (consecutiveNights >= 3 && shift.isNightShift) {
      errors.push(`La enfermera excedería el límite de noches consecutivas (${consecutiveNights + 1}).`);
    } else if (consecutiveNights >= 2 && shift.isNightShift) {
      warnings.push(`La enfermera llevaría ${consecutiveNights + 1} noches consecutivas.`);
    }

    return { errors, warnings };
  }

  /**
   * Valida especialidades y competencias para cada enfermera involucrada
   */
  private async validateSpecialties(
    requesterNurseId: string,
    receiverId: string | null | undefined,
    sourceEntry: any,
    targetEntry: any | null,
    operationType: ShiftChangeOperationType,
  ): Promise<{ hardBlocks: ValidationRuleResult[]; softWarnings: ValidationRuleResult[] }> {
    const hardBlocks: ValidationRuleResult[] = [];
    const softWarnings: ValidationRuleResult[] = [];

    const requesterNurseRecord = await this.prisma.nurse.findUnique({
      where: { id: requesterNurseId },
      select: { specialityId: true },
    });

    const nursesToValidate: Array<{ nurseId: string; nurseSpecialityId: string | null; shiftId: string }> = [
      {
        nurseId: requesterNurseId,
        nurseSpecialityId: requesterNurseRecord?.specialityId ?? null,
        shiftId: sourceEntry.shiftId,
      },
    ];

    if (receiverId) {
      const receiverNurse = await this.prisma.nurse.findUnique({
        where: { userId: receiverId },
        select: { id: true, specialityId: true },
      });

      if (receiverNurse) {
        nursesToValidate.push({
          nurseId: receiverNurse.id,
          nurseSpecialityId: receiverNurse.specialityId,
          shiftId: sourceEntry.shiftId,
        });
      }
    }

    if (operationType === ShiftChangeOperationType.SWAP && targetEntry) {
      nursesToValidate.push({
        nurseId: requesterNurseId,
        nurseSpecialityId: requesterNurseRecord?.specialityId ?? null,
        shiftId: targetEntry.shiftId,
      });
    }

    for (const { nurseId, nurseSpecialityId, shiftId } of nursesToValidate) {
      const shift = await this.prisma.shift.findUnique({
        where: { id: shiftId },
      });

      if (!shift || !shift.departmentId) continue;

      const requiredSpecialities = await this.prisma.departmentSpeciality.findMany({
        where: {
          departmentId: shift.departmentId,
          required: true,
        },
      });

      for (const reqSpec of requiredSpecialities) {
        if (reqSpec.specialityId && nurseSpecialityId !== reqSpec.specialityId) {
          hardBlocks.push({
            rule: "SPECIALTY_REQUIRED",
            type: "HARD",
            valid: false,
            message: `La enfermera no posee la especialidad requerida para el turno.`,
          });
          break;
        }
      }
    }

    return { hardBlocks, softWarnings: [] };
  }

  /**
   * Valida reglas organizacionales (departamento, sede, contrato)
   */
  private async validateOrganizationalRules(
    requesterId: string,
    receiverNurseRecord: any | null,
    sourceEntry: any,
    targetEntry: any | null,
    operationType: ShiftChangeOperationType,
    organizationId: string,
  ): Promise<{ hardBlocks: ValidationRuleResult[]; softWarnings: ValidationRuleResult[] }> {
    const hardBlocks: ValidationRuleResult[] = [];
    const softWarnings: ValidationRuleResult[] = [];

    // Para SWAP y TRANSFER: verificar que no se crucen departamentos si no está permitido
    if (
      operationType === ShiftChangeOperationType.SWAP &&
      targetEntry &&
      sourceEntry.shiftTemplate?.departmentId !== targetEntry.shiftTemplate?.departmentId
    ) {
      const deptConfig = await this.prisma.departmentConfiguration.findFirst({
        where: {
          departmentId: sourceEntry.shiftTemplate.departmentId,
        },
      });

      if (deptConfig && !deptConfig.allow_externeal_support) {
        hardBlocks.push({
          rule: "CROSS_DEPARTMENT",
          type: "HARD",
          valid: false,
          message: "No se permiten intercambios entre departamentos (soporte externo deshabilitado).",
        });
      }
    }

    return { hardBlocks, softWarnings: [] };
  }

  /**
   * Calcula la cobertura de personal para un departamento/sede/fecha.
   */
  private async calculateCoverage(
    departmentId: string,
    branchId: string | null | undefined,
    date: Date,
  ): Promise<any> {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const entries = await this.prisma.scheduleEntry.findMany({
      where: {
        schedule: { departmentId },
        ...(branchId && { branchId }),
        date: { gte: dayStart, lte: dayEnd },
        status: { in: ["ASSIGNED", "CONFIRMED"] as ScheduleEntryStatus[] },
      },
      include: {
        shift: true,
        shiftTemplate: { include: { department: true } },
        nurse: true,
      },
    });

    const totalShifts = entries.length;
    const totalNurses = new Set(entries.map((e) => e.nurseId).filter(Boolean)).size;
    const requiredStaff = entries.reduce(
      (acc, e) => acc + (e.shiftTemplate?.minimum_staff || 1),
      0,
    );

    return {
      departmentId,
      branchId: branchId ?? null,
      date: dayStart,
      totalShifts,
      totalNurses,
      requiredStaff,
      coveragePercentage:
        requiredStaff > 0
          ? Math.min(100, Math.round((totalNurses / requiredStaff) * 100))
          : 0,
      deficit: Math.max(0, requiredStaff - totalNurses),
    };
  }

  /**
   * Re-validación antes de aplicar el cambio.
   * Detecta cambios concurrentes en las asignaciones.
   */
  async revalidateBeforeApply(
    requestId: string,
    organizationId: string,
  ): Promise<ShiftChangeValidationResult> {
    const request = await this.prisma.shiftChangeRequest.findUnique({
      where: { id: requestId },
      include: {
        sourceScheduleEntry: {
          include: { shift: true, shiftTemplate: true, nurse: true },
        },
        targetScheduleEntry: {
          include: { shift: true, shiftTemplate: true, nurse: true },
        },
      },
    });

    if (!request) {
      throw new NotFoundException("Solicitud de cambio no encontrada.");
    }

    if (request.organizationId !== organizationId) {
      throw new ForbiddenException("No pertenece a su organización.");
    }

    // Verificar que la asignación de origen aún existe y no ha cambiado de enfermera
    const currentSource = await this.prisma.scheduleEntry.findUnique({
      where: { id: request.sourceScheduleEntryId },
      select: { id: true, nurseId: true, status: true },
    });

    if (!currentSource) {
      throw new BadRequestException("La asignación de origen ya no existe.");
    }

    const sourceNurse = await this.prisma.nurse.findUnique({
      where: { id: currentSource.nurseId ?? undefined },
      select: { userId: true },
    });

    if (!sourceNurse || sourceNurse.userId !== request.requesterId) {
      throw new BadRequestException(
        "La asignación de origen ha sido modificada por otra operación.",
      );
    }

    if (request.targetScheduleEntryId) {
      const currentTarget = await this.prisma.scheduleEntry.findUnique({
        where: { id: request.targetScheduleEntryId },
        select: { id: true, nurseId: true },
      });

      if (!currentTarget) {
        throw new BadRequestException("La asignación de destino ya no existe.");
      }

      if (currentTarget.nurseId !== request.targetScheduleEntry?.nurseId) {
        throw new BadRequestException(
          "La asignación de destino ha sido modificada por otra operación.",
        );
      }
    }

    // Re-ejecutar validación completa
    return this.validate({
      requesterId: request.requesterId,
      receiverId: request.receiverId,
      sourceScheduleEntryId: request.sourceScheduleEntryId,
      targetScheduleEntryId: request.targetScheduleEntryId,
      operationType: request.operationType,
      organizationId,
    });
  }
}