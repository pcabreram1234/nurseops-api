import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';
import { ValidateAssignmentDto } from '../dto/validate-assignment.dto';
import { SingleValidationResult } from '../interfaces/single-validation-result.interface';
import { startOfMonth, endOfMonth, subDays } from 'date-fns';
import { IndividualScheduleSlot } from '../interfaces/schedule-slot-interface';
import { IndividualNurseStateTracker } from '@modules/nurses/interfaces/nurse-state-tracker-interface';
import { randomUUID } from 'node:crypto';
import { differenceInDays, isSameDay, differenceInHours, isBefore, isAfter } from 'date-fns';
import { evaluateHardRule } from '../rule-engine/evaluators';
import { SystemConfigurationKeys } from '@prisma/client';
import { windowsOverlap, maxConcurrentWindows, TimeWindowLike } from '../utils/simultaneity.util';

export interface UserOrgContext {
  organizationId?: string;
  departmentId?: string;
  role?: string;
  id?: string;
  sub?: string;
}

/**
 * Resuelve el departmentId del usuario a partir del JWT.
 */
async function resolveUserDepartmentId(prisma: PrismaService, userOrg: UserOrgContext): Promise<string | undefined> {
  if (userOrg.departmentId) {
    return userOrg.departmentId;
  }
  const userId = userOrg.id || userOrg.sub;
  if (!userId) return undefined;

  const nurse = await prisma.nurse.findFirst({
    where: { userId },
    select: { departmentId: true },
  });
  return nurse?.departmentId;
}

/**
 * Verifica si el usuario puede operar sobre un departamento dado.
 * - SUPER: sin restricciones.
 * - HR_MANAGER / SYSTEM_ADMIN: cualquier departamento de su organización.
 * - HEAD_DEPARTMENT / SUPERVISOR: solo su propio departamento.
 */
function checkDepartmentAccess(departmentId: string, departmentOrgId: string | undefined, userOrg: UserOrgContext): void {
  if (!userOrg) {
    throw new ForbiddenException("Contexto de usuario no disponible.");
  }

  if (userOrg.role === "SUPER") return; // Sin restricciones

  if (departmentOrgId && userOrg.organizationId && departmentOrgId !== userOrg.organizationId) {
    throw new ForbiddenException("El departamento no pertenece a su organización.");
  }

  if (["HR_MANAGER", "SYSTEM_ADMIN"].includes(userOrg.role!)) {
    return; // Puede acceder a cualquier departamento de su organización
  }

  if (["HEAD_DEPARTMENT", "NIGHT_SUPERVISOR", "SUPERVISOR"].includes(userOrg.role!)) {
    if (!userOrg.departmentId || departmentId !== userOrg.departmentId) {
      throw new ForbiddenException("Solo puede operar sobre su propio departamento.");
    }
    return;
  }

  throw new ForbiddenException("Su rol no tiene permiso para operar sobre este departamento.");
}

@Injectable()
export class ScheduleValidationService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Orquestador Principal de Validación en Tiempo Real
   */
  async validateSingleAssignment(dto: ValidateAssignmentDto, userOrg?: UserOrgContext): Promise<SingleValidationResult> {
    const { nurseId, shiftId, date, entryId } = dto;
    const targetDate = new Date(date);

    // 🌟 TU PROPUESTA BLINDADA:
    const resolvedTemplate = await this.prisma.shiftTemplate.findFirst({
      where: {
        OR: [
          { id: shiftId },
          { shifts: { some: { id: shiftId } } }
        ]
      },
      select: { id: true, departmentId: true }
    });

    if (!resolvedTemplate) {
      throw new NotFoundException(`No template or clinical shift associated with the ID was found: ${shiftId}`);
    }

    // Resolver departmentId del usuario para validar acceso al departamento del turno
    const userDeptId = await resolveUserDepartmentId(this.prisma, userOrg ?? {});
    const userContextWithDept = {
      ...userOrg,
      departmentId: userDeptId || userOrg?.departmentId,
    };

    // Validar acceso al departamento del turno antes de continuar
    if (resolvedTemplate.departmentId) {
      const templateDept = await this.prisma.department.findUnique({
        where: { id: resolvedTemplate.departmentId },
        select: { organizationId: true },
      });
      if (templateDept) {
        checkDepartmentAccess(resolvedTemplate.departmentId, templateDept.organizationId, userContextWithDept);
      }
    }

    // ==========================================================================
    // FASE A: RECOLECCIÓN DEL CONTEXTO ACTUAL (Fotografía del Mes en RAM)
    // ==========================================================================
    const context = await this.buildSingleNurseContext(nurseId, resolvedTemplate?.id, targetDate, entryId);

    const errors: string[] = [];
    const warnings: string[] = [];

    // --- Validación de Bloqueos Físicos/Legales Inmediatos ---
    const isOnVacation = context.blocks.vacations.some(v =>
      targetDate >= new Date(v.date) && targetDate <= new Date(v.endDate)
    );

    if (isOnVacation) {
      errors.push(`The nurse is currently on approved vacation.`);
    }

    const hasLeave = context.blocks.leaves.some(l =>
      targetDate >= new Date(l.startDate) && targetDate <= new Date(l.endDate)
    );
    if (hasLeave) {
      errors.push(`The nurse has an approved medical leave for this day.`);
    }

    // Validar Restricciones Clínicas de Salud Ocupacional
    if (context.restrictions.length > 0) {
      for (const restriction of context.restrictions) {
        const type = restriction.restrictionType;
        if (!type) continue;

        const isConflict = this.evaluateRestrictionConflict(type.name, context.targetShift, targetDate, context);

        if (isConflict) {
          const message = `${type.description || type.name}.`;

          switch (type.severity) {
            case 'CRITICAL':
            case 'URGENT':
            case 'HIGH':
              errors.push(`Medical Restriction: ${message}`);
              break;

            case 'MEDIUM':
            case 'LOW':
              warnings.push(`Profile Limitation: ${message}`);
              break;

            case 'INFO':
              console.log(`[SILENT LOG - INFO] Nurse ${nurseId} on ${date}: violated minor preference -> ${type.name}`);
              break;

            default:
              errors.push(`Active medical restriction: ${message}`);
              break;
          }
        }
      }
    }

    // ==========================================================================
    // 🌟 NUEVA VALIDACIÓN 4: DEPARTAMENTO CORRECTO Y CROSS-DEPARTMENTAL
    // ==========================================================================
    const shiftDepartmentId = context.targetShift?.departmentId;
    const nurseDepartmentId = context.nurse?.departmentId;

    if (shiftDepartmentId && nurseDepartmentId && shiftDepartmentId !== nurseDepartmentId) {
      const canFloat = (context.nurse as any).isCrossDepartmental === true;

      if (!canFloat) {
        errors.push(
          `The nurse belongs to the department "${context.nurse?.department?.name || 'Original'}". ` +
          `Cross-departmental assignments are disabled for this staff profile.`
        );
      } else {
        warnings.push(
          `Cross-departmental assignment: Nurse belongs to "${context.nurse?.department?.name || 'another department'}" ` +
          `but has permissions to cover this shift.`
        );
      }
    }

    // ==========================================================================
    // 🌟 NUEVA VALIDACIÓN 4b: MÁXIMO DE ENFERMERAS SIMULTÁNEAS POR DEPARTAMENTO
    // ==========================================================================
    const limitDepartmentId = shiftDepartmentId || nurseDepartmentId;
    if (limitDepartmentId && context.targetShift) {
      const deptConfig = await this.prisma.departmentConfiguration.findFirst({
        where: { departmentId: limitDepartmentId },
        select: { maxSimultaneousNurses: true },
      });

      const maxSim = deptConfig?.maxSimultaneousNurses ?? null;
      if (maxSim !== null && maxSim > 0) {
        const dayStart = new Date(targetDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(targetDate);
        dayEnd.setHours(23, 59, 59, 999);

        const entriesToday = await this.prisma.scheduleEntry.findMany({
          where: {
            date: { gte: dayStart, lte: dayEnd },
            nurseId: { not: null },
            ...(entryId ? { id: { not: entryId } } : {}),
            shiftTemplate: { departmentId: limitDepartmentId },
          },
          include: {
            shiftTemplate: {
              select: { startTime: true, endTime: true, isNightShift: true },
            },
          },
        });

        const targetWindow: TimeWindowLike = {
          startTime: context.targetShift.startTime,
          endTime: context.targetShift.endTime,
          isNightShift: context.targetShift.isNightShift === true,
        };

        const simultaneous = entriesToday.filter(
          (e) => e.shiftTemplate && windowsOverlap(targetWindow, e.shiftTemplate),
        );

        if (simultaneous.length >= maxSim) {
          errors.push(
            `Operational Limit: the department allows a maximum of ${maxSim} simultaneous nurses ` +
            `and ${simultaneous.length} are already assigned to overlapping shifts on this date.`,
          );
        }
      }
    }

    if (errors.length > 0) {
      console.log("🛑 Bloqueando asignación en Fase A. Errores detectados:", errors);
      return {
        canAssign: false,
        errors: errors,
        warnings: warnings
      };
    }

    // ==========================================================================
    // 🌟 NUEVA VALIDACIÓN 5: SOLAPAMIENTO HORARIO
    // ==========================================================================
    if (context.historicalEntries && context.historicalEntries.length > 0) {
      const [candStartH, candStartM] = context.targetShift?.startTime?.split(':').map(Number) ?? [];
      const [candEndH, candEndM] = context.targetShift?.endTime?.split(':').map(Number) ?? [];

      const candidateStart = new Date(targetDate);
      candidateStart.setHours(candStartH, candStartM, 0, 0);

      let candidateEnd = new Date(targetDate);
      candidateEnd.setHours(candEndH, candEndM, 0, 0);

      if (candidateEnd <= candidateStart) {
        candidateEnd.setDate(candidateEnd.getDate() + 1);
      }

      for (const existingEntry of context.historicalEntries) {
        if (isSameDay(new Date(existingEntry.date), targetDate)) {
          const shiftInfo = existingEntry.shift || existingEntry.shiftTemplate;
          if (!shiftInfo) continue;

          const startTimeDate = new Date(shiftInfo.startTime);
          const endTimeDate = new Date(shiftInfo.endTime);

          const existStartH = startTimeDate.getHours();
          const existStartM = startTimeDate.getMinutes();
          const existEndH = endTimeDate.getHours();
          const existEndM = endTimeDate.getMinutes();

          const existingStart = new Date(existingEntry.date);
          existingStart.setHours(existStartH, existStartM, 0, 0);

          let existingEnd = new Date(existingEntry.date);
          existingEnd.setHours(existEndH, existEndM, 0, 0);

          if (existingEnd <= existingStart) {
            existingEnd.setDate(existingEnd.getDate() + 1);
          }

          const blocksOverlap = candidateStart < existingEnd && candidateEnd > existingStart;

          if (blocksOverlap) {
            const formattedStart = `${String(existStartH).padStart(2, '0')}:${String(existStartM).padStart(2, '0')}`;
            const formattedEnd = `${String(existEndH).padStart(2, '0')}:${String(existEndM).padStart(2, '0')}`;

            errors.push(
              `Schedule Conflict: The nurse is already assigned to the shift "${shiftInfo.name}" ` +
              `(${formattedStart} - ${formattedEnd}) on this day. It is physically impossible to be in two places at once.`
            );
            break;
          }
        }
      }
    }

    if (errors.length > 0) {
      return { canAssign: false, errors, warnings };
    }

    // ==========================================================================
    // FASE B: INYECCIÓN VIRTUAL
    // ==========================================================================
    const { slots, state } = this.simulateTimeline(context, targetDate);

    const virtualSlot = slots.find(s =>
      s.shiftTemplateId === resolvedTemplate.id && isSameDay(s.date, targetDate)
    );

    if (!virtualSlot) {
      throw new NotFoundException(
        `The simulated environment could not be structured for the assigned shift on the date ${targetDate.toISOString().split('T')[0]}.`
      );
    }

    // ==========================================================================
    // FASE C: EVALUACIÓN MEDIANTE TU RULE ENGINE EXISTENTE
    // ==========================================================================
    const rules = context.settings.rules;

    const ruleErrors: string[] = [];

    const mockScheduleContext: any = {
      settings: {
        department: context.settings.department,
        global: context.settings.global
      },
      blocks: context.blocks
    };

    for (const rule of rules) {
      const { id, date, shiftId, shiftTemplateId, requiredSpecialityId, assignedNurseId, metrics, shiftInfo, generatedShiftId } = virtualSlot;
      const cleanShiftInfo = {
        type: shiftInfo.type,
        durationHours: shiftInfo.duration,
        isNightShift: shiftInfo.isNightShift,
        startTime: shiftInfo.startTime,
        endTime: shiftInfo.endTime
      }

      const cleanSlot = {
        id: id,
        date: date,
        shiftId: shiftId,
        shiftTemplateId: shiftTemplateId,
        requiredSpecialityId: requiredSpecialityId,
        assignedNurseId: assignedNurseId,
        metrics: metrics,
        shiftInfo: cleanShiftInfo,
        generatedShiftId: generatedShiftId,
      }

      const result = evaluateHardRule(rule, context.nurse, cleanSlot, state, mockScheduleContext);

      if (!result.isValid) {
        const message = result.reason || `Violation of the business rule: ${rule.name}`;

        if (rule.type === 'HARD') {
          ruleErrors.push(`[Critical] ${message}`);
        } else if (rule.type === 'SOFT') {
          warnings.push(`[Warning] ${message}`);
        }
      }
    }

    const finalErrors = [...errors, ...ruleErrors];
    return {
      canAssign: finalErrors.length === 0,
      errors: finalErrors,
      warnings: warnings,
    };
  }

  /**
   * FASE A - Extractor Quirúrgico de Contexto para un único Enfermero/a
   */
  async buildSingleNurseContext(
    nurseId: string,
    shiftId: string,
    targetDate: Date,
    currentEntryId?: string
  ) {
    const startOfCurrentMonth = startOfMonth(targetDate);
    const endOfCurrentMonth = endOfMonth(targetDate);
    const sixDaysAgo = subDays(startOfCurrentMonth, 6);

    const nurse = await this.prisma.nurse.findUnique({
      where: { id: nurseId },
      include: { department: true }
    });

    if (!nurse) {
      throw new NotFoundException(`Nurse with ID ${nurseId} not found.`);
    }

    const organizationId = nurse.organizationId;
    const departmentId = nurse.departmentId;

    const [
      activeRules,
      globalSettings,
      departmentSettings,
      vacations,
      leaves,
      restrictions,
      historicalEntries,
      simulatedShiftInfo
    ] = await Promise.all([
      this.prisma.workRule.findMany({
        where: {
          organizationId,
          isActive: true,
          workRuleActions: { some: { enabled: true } },
        },
        include: {
          workRuleConditions: true,
          workRuleActions: true,
        },
      }),
      this.prisma.systemConfiguration.findMany({}),
      this.prisma.department.findUnique({
        where: { id: departmentId },
      }),
      this.prisma.absence.findMany({
        where: {
          nurseId,
          type: 'VACATION',
          status: 'APPROVED',
          OR: [
            { date: { lte: endOfCurrentMonth }, endDate: { gte: startOfCurrentMonth } }
          ]
        }
      }),
      this.prisma.leave.findMany({
        where: {
          userId: nurseId,
          status: 'APPROVED',
          OR: [
            { startDate: { lte: endOfCurrentMonth }, endDate: { gte: startOfCurrentMonth } }
          ]
        }
      }),
      this.prisma.nurseRestriction.findMany({
        where: { nurseId, isActive: true },
        include: { restrictionType: true }
      }),
      this.prisma.scheduleEntry.findMany({
        where: {
          nurseId,
          date: { gte: sixDaysAgo, lte: endOfCurrentMonth },
          id: currentEntryId ? { not: currentEntryId } : undefined,
        },
        include: {
          shift: true,
          shiftTemplate: true
        },
        orderBy: { date: 'asc' },
      }),
      this.prisma.shiftTemplate.findUnique({
        where: { id: shiftId }
      })
    ]);

    return {
      nurse,
      targetShift: simulatedShiftInfo,
      settings: {
        global: globalSettings,
        department: departmentSettings,
        rules: activeRules
      },
      blocks: {
        vacations,
        leaves
      },
      restrictions,
      historicalEntries
    };
  }

  private simulateTimeline(context: any, targetDate: Date): { slots: IndividualScheduleSlot[], state: IndividualNurseStateTracker } {
    const { historicalEntries, targetShift, nurse } = context;

    const realSlots: IndividualScheduleSlot[] = historicalEntries.map(entry => {
      const shiftInfo = entry.shift || entry.shiftTemplate;
      return {
        id: entry.id,
        date: new Date(entry.date),
        shiftId: entry.shiftId,
        shiftTemplateId: entry.shiftTemplateId,
        requiredSpecialityId: null,
        assignedNurseId: entry.nurseId,
        shiftInfo: {
          id: shiftInfo.id,
          name: shiftInfo.name,
          startTime: shiftInfo.startTime,
          endTime: shiftInfo.endTime,
          duration: Number(shiftInfo.duration || 8),
          isNightShift: shiftInfo.isNightShift,
          type: shiftInfo.type
        },
        generatedShiftId: ""
      };
    });

    const [startH, startM] = targetShift.startTime.split(':').map(Number);
    const simulatedStartTime = new Date(targetDate);
    simulatedStartTime.setHours(startH, startM, 0, 0);

    const [endH, endM] = targetShift.endTime.split(':').map(Number);
    const simulatedEndTime = new Date(targetDate);
    simulatedEndTime.setHours(endH, endM, 0, 0);

    const virtualSlot: IndividualScheduleSlot = {
      id: randomUUID(),
      date: targetDate,
      shiftId: null,
      shiftTemplateId: targetShift.id,
      requiredSpecialityId: null,
      assignedNurseId: nurse.id,
      shiftInfo: {
        id: targetShift.id,
        name: targetShift.name,
        startTime: targetShift.startTime,
        endTime: targetShift.endTime,
        duration: Number(targetShift.duration || 8),
        isNightShift: targetShift.isNightShift,
        type: targetShift.type
      },
      generatedShiftId: ""
    };

    const simulatedSlots = [...realSlots, virtualSlot].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    const state: IndividualNurseStateTracker = this.calculateNurseState(simulatedSlots, nurse.id, targetDate);

    return {
      slots: simulatedSlots,
      state
    };
  }

  private calculateNurseState(slots: IndividualScheduleSlot[], nurseId: string, targetDate: Date): IndividualNurseStateTracker {
    let assignedHours = 0;
    let consecutiveDaysWorked = 0;
    let consecutiveNightsWorked = 0;
    let lastShiftEndTime: Date | null = null;
    let wasLastShiftNight = false;

    for (const slot of slots) {
      if (isSameDay(slot.date, targetDate)) {
        break;
      }

      const duration = slot.shiftInfo?.duration || 8;
      assignedHours += duration;

      if (slot.shiftInfo?.isNightShift) {
        consecutiveNightsWorked++;
      } else {
        consecutiveNightsWorked = 0;
      }

      if (lastShiftEndTime) {
        const dayDiff = differenceInDays(slot.date, lastShiftEndTime);
        if (dayDiff <= 1) {
          consecutiveDaysWorked++;
        } else {
          consecutiveDaysWorked = 1;
        }
      } else {
        consecutiveDaysWorked = 1;
      }

      if (slot.shiftInfo?.endTime) {
        const [endH, endM] = slot.shiftInfo.endTime.toString().split(':').map(Number);
        const endRef = new Date(slot.date);
        endRef.setHours(endH, endM, 0, 0);
        lastShiftEndTime = endRef;
      }
      wasLastShiftNight = slot.shiftInfo?.isNightShift || false;
    }

    return {
      nurseId,
      assignedHours,
      consecutiveDaysWorked,
      consecutiveNightsWorked,
      lastShiftEndTime,
      wasLastShiftNight,
      preferredShiftsCovered: 0,
      weekendShiftsCovered: 0,
      fairnessScore: 100,
      fatigueScore: 0
    };
  }

  async validateSchedule(scheduleId: string) {
    const configs = await this.prisma.systemConfiguration.findMany();
    const configMap = new Map(configs.map((c) => [c.key, c.value]));

    const maxMonthlyHours = Number(configMap.get(SystemConfigurationKeys.MAX_MONTHLY_HOURS) || 160);
    const minRestHours = Number(configMap.get(SystemConfigurationKeys.MIN_REST_HOURS) || 12);
    const maxConsecutiveNights = Number(configMap.get(SystemConfigurationKeys.MAX_CONSECUTIVE_NIGHTS) || 3);

    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        scheduleEntries: {
          include: {
            shift: true,
            shiftTemplate: true,
            nurse: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!schedule) {
      throw new BadRequestException("The specified master schedule does not exist.");
    }

    if (!schedule.scheduleEntries || schedule.scheduleEntries.length === 0) {
      throw new BadRequestException("Publication block: The schedule does not have any established shift assignments.");
    }

    const unassignedSlots = schedule.scheduleEntries.filter(entry => !entry.nurseId);

    if (unassignedSlots.length > 0) {
      throw new BadRequestException({
        message: "The schedule cannot be published because it contains unassigned slots..",
        errors: [
          `Operational Blockage: A total of ${unassignedSlots.length} vacant shifts/slots were detected during the period. All generated shifts must have assigned personnel before the official publication..`
        ]
      });
    }

    const errors: string[] = [];

    const templateCoverage = new Map<string, { assigned: number; required: number; name: string }>();

    for (const entry of schedule.scheduleEntries) {
      if (entry.shiftTemplate) {
        const tId = entry.shiftTemplate.id;
        const current = templateCoverage.get(tId) || {
          assigned: 0,
          required: entry.shiftTemplate.minimum_staff,
          name: entry.shiftTemplate.name || entry.shiftTemplate.type,
        };
        if (entry.nurseId) {
          current.assigned += 1;
        }
        templateCoverage.set(tId, current);
      }
    }

    for (const [tId, data] of templateCoverage.entries()) {
      if (data.assigned < data.required) {
        errors.push(
          `Coverage Shortage: The "${data.name}" template requires a minimum of ${data.required} nurses, but only ${data.assigned} have been assigned..`
        );
      }
    }

    const publishDeptConfig = schedule.departmentId
      ? await this.prisma.departmentConfiguration.findFirst({
        where: { departmentId: schedule.departmentId },
        select: { maxSimultaneousNurses: true },
      })
      : null;

    const publishMaxSim = publishDeptConfig?.maxSimultaneousNurses ?? null;
    if (publishMaxSim !== null && publishMaxSim > 0) {
      const entriesByDay = new Map<number, typeof schedule.scheduleEntries>();
      for (const entry of schedule.scheduleEntries) {
        if (!entry.nurseId || !entry.shiftTemplate) continue;
        const dayKey = new Date(entry.date).setHours(0, 0, 0, 0);
        if (!entriesByDay.has(dayKey)) entriesByDay.set(dayKey, []);
        entriesByDay.get(dayKey)!.push(entry);
      }

      for (const [dayKey, dayEntries] of entriesByDay.entries()) {
        const windows: TimeWindowLike[] = dayEntries.map((e) => ({
          startTime: e.shiftTemplate!.startTime,
          endTime: e.shiftTemplate!.endTime,
          isNightShift: e.shiftTemplate!.isNightShift === true,
        }));

        const peak = maxConcurrentWindows(windows);
        if (peak > publishMaxSim) {
          errors.push(
            `Operational Limit: on ${new Date(dayKey).toISOString().split('T')[0]} up to ${peak} simultaneous nurses ` +
            `were assigned, exceeding the department maximum of ${publishMaxSim}.`
          );
        }
      }
    }

    const nurseEntriesMap = new Map<string, typeof schedule.scheduleEntries>();
    for (const entry of schedule.scheduleEntries) {
      if (entry.nurseId) {
        const list = nurseEntriesMap.get(entry.nurseId) || [];
        list.push(entry);
        nurseEntriesMap.set(entry.nurseId, list);
      }
    }

    for (const [nurseId, entries] of nurseEntriesMap.entries()) {
      const nurseName = `${entries[0].nurse?.user?.firstName || "Nurse"} ${entries[0].nurse?.user?.lastName || ""}`;

      const sortedEntries = [...entries].sort((a, b) => {
        const startA = a.shift?.startTime ? new Date(a.shift.startTime).getTime() : 0;
        const startB = b.shift?.startTime ? new Date(b.shift.startTime).getTime() : 0;
        return startA - startB;
      });

      let totalNurseHours = 0;
      let consecutiveNightsCount = 0;

      for (let i = 0; i < sortedEntries.length; i++) {
        const current = sortedEntries[i];
        if (!current.shift) continue;

        const currentStart = new Date(current.shift.startTime);
        const currentEnd = new Date(current.shift.endTime);
        const currentDuration = differenceInHours(currentEnd, currentStart);
        totalNurseHours += currentDuration;

        if (current.shift.type === "NIGHT") {
          consecutiveNightsCount++;
          if (consecutiveNightsCount > maxConsecutiveNights) {
            errors.push(
              `Fatigue Risk: ${nurseName} exceeds the regulatory limit of ${maxConsecutiveNights} consecutive nights of work.`
            );
          }
        } else {
          consecutiveNightsCount = 0;
        }

        if (i < sortedEntries.length - 1) {
          const next = sortedEntries[i + 1];
          if (!next.shift) continue;

          const nextStart = new Date(next.shift.startTime);
          const nextEnd = new Date(next.shift.endTime);

          if (isBefore(nextStart, currentEnd)) {
            errors.push(
              `Time Conflict (Overlap): ${nurseName} is assigned the shift [${current.shift.type}] that ends at ${currentEnd.toLocaleTimeString()} and the shift [${next.shift.type}] that starts earlier (${nextStart.toLocaleTimeString()}) on the same day.`
            );
          }

          const restHoursBetween = differenceInHours(nextStart, currentEnd);
          if (isAfter(nextStart, currentEnd) && restHoursBetween < minRestHours) {
            errors.push(
              `Rest Violation: ${nurseName} ends her shift at ${currentEnd.toLocaleString()} and her next shift starts in less than the ${minRestHours} minimum mandatory rest hours (Actual time: ${restHoursBetween}h).`
            );
          }
        }
      }

      if (totalNurseHours > maxMonthlyHours) {
        errors.push(
          `Excessive Workload: ${nurseName} accumulates a total of ${totalNurseHours} hours in this quadrant, exceeding the configured institutional limit of ${maxMonthlyHours} monthly hours.`
        );
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: "El cuadrante no cumple con los requisitos de seguridad operacional y médica para ser publicado.",
        errors,
      });
    }

    return {
      valid: true,
    };
  }

  async validateAssignment(nurseId: string, date: Date, shiftId: string, userOrg?: UserOrgContext) {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Resolver departmentId del usuario
    const userDeptId = await resolveUserDepartmentId(this.prisma, userOrg ?? {});
    const userContextWithDept = {
      ...userOrg,
      departmentId: userDeptId || userOrg?.departmentId,
    };

    // 1. Verificar Restricciones Activas
    const restrictions = await this.prisma.nurseRestriction.findMany({
      where: { nurseId, isActive: true },
      include: { restrictionType: true }
    });

    // 2. Verificar departamento del enfermero para control de acceso
    const nurse = await this.prisma.nurse.findUnique({
      where: { id: nurseId },
      select: { departmentId: true, organizationId: true },
    });

    if (!nurse) {
      throw new NotFoundException(`Nurse with ID ${nurseId} not found.`);
    }

    // Verificar acceso al departamento del enfermero
    if (nurse.departmentId) {
      checkDepartmentAccess(nurse.departmentId, nurse.organizationId, userContextWithDept);
    }

    // 3. Horas acumuladas en el mes
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const monthlyHours = await this.prisma.scheduleEntry.aggregate({
      where: { nurseId, date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { /* lógica de sumar duración de shifts */ }
    });

    // 4. Descanso mínimo
    const lastShift = await this.prisma.scheduleEntry.findFirst({
      where: { nurseId, date: { lt: date } },
      orderBy: { date: 'desc' }
    });

    // --- Lógica de Negocio ---
    if (restrictions.length > 0) {
      errors.push(`Tiene ${restrictions.length} restricciones médicas activas.`);
    }

    return {
      canAssign: errors.length === 0,
      errors,
      monthlyHours: monthlyHours._sum || 0,
      lastShiftDate: lastShift?.date
    };
  }

  private evaluateRestrictionConflict(
    restrictionName: string,
    targetShift: any,
    targetDate: Date,
    context: any
  ): boolean {

    switch (restrictionName) {
      case 'NO_NIGHT_SHIFTS':
        return targetShift.isNightShift === true;

      case 'ONLY_NIGHT_SHIFTS':
        return targetShift.isNightShift === false;

      case 'ONLY_DAY_SHIFTS':
      case 'ONLY_MORNING_SHIFTS':
        return targetShift.name !== 'MORNING' && targetShift.name !== 'FULL_DAY';

      case 'NO_WEEKENDS':
        const dayOfWeek = targetDate.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6;

      case 'WEEKENDS_ONLY':
        const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6;
        return !isWeekend;

      case 'NO_DOUBLE_SHIFTS':
        const shiftsThatDay = context.historicalEntries.filter((entry: any) =>
          isSameDay(new Date(entry.date), targetDate)
        );
        return shiftsThatDay.length > 0;

      case 'PART_TIME_ONLY':
      case 'MAX_8_HOURS_DAY':
        return targetShift.durationHours > 8;

      case 'MAX_40_HOURS_WEEK': {
        if (!targetShift?.durationHours) return false;

        const currentDay = targetDate.getDay();
        const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;

        const mondayOfWeek = new Date(targetDate);
        mondayOfWeek.setDate(targetDate.getDate() - distanceToMonday);
        mondayOfWeek.setHours(0, 0, 0, 0);

        const sundayOfWeek = new Date(mondayOfWeek);
        sundayOfWeek.setDate(mondayOfWeek.getDate() + 6);
        sundayOfWeek.setHours(23, 59, 59, 999);

        const weeklyHoursAlreadyAssigned = context.historicalEntries
          .filter((entry: any) => {
            const entryDate = new Date(entry.date);
            return entryDate >= mondayOfWeek && entryDate <= sundayOfWeek && entry.shift?.durationHours;
          })
          .reduce((sum: number, entry: any) => sum + Number(entry.shift.durationHours), 0);

        return (weeklyHoursAlreadyAssigned + Number(targetShift.durationHours)) > 40;
      }

      case 'NO_OVERTIME': {
        if (!targetShift?.startTime || !targetShift?.endTime) return false;

        const targetStartStr = targetShift.startTime.split('T')[1] || '00:00:00';
        const targetEndStr = targetShift.endTime.split('T')[1] || '00:00:00';

        const targetStartAbs = new Date(targetDate);
        const [sH, sM] = targetStartStr.split(':').map(Number);
        targetStartAbs.setHours(sH, sM, 0, 0);

        const targetEndAbs = new Date(targetDate);
        const [eH, eM] = targetEndStr.split(':').map(Number);
        targetEndAbs.setHours(eH, eM, 0, 0);

        if (targetEndAbs < targetStartAbs) {
          targetEndAbs.setDate(targetEndAbs.getDate() + 1);
        }

        const TWELVE_HOURS_IN_MS = 12 * 60 * 60 * 60 * 1000;

        for (const entry of context.historicalEntries) {
          if (!entry.shift?.startTime || !entry.shift?.endTime) continue;

          const entryDate = new Date(entry.date);
          const entryStartStr = entry.shift.startTime.split('T')[1];
          const entryEndStr = entry.shift.endTime.split('T')[1];

          const entryStartAbs = new Date(entryDate);
          const [esH, esM] = entryStartStr.split(':').map(Number);
          entryStartAbs.setHours(esH, esM, 0, 0);

          const entryEndAbs = new Date(entryDate);
          const [eeH, eeM] = entryEndStr.split(':').map(Number);
          entryEndAbs.setHours(eeH, eeM, 0, 0);

          if (entryEndAbs < entryStartAbs) {
            entryEndAbs.setDate(entryEndAbs.getDate() + 1);
          }

          if (targetStartAbs >= entryEndAbs) {
            if ((targetStartAbs.getTime() - entryEndAbs.getTime()) < TWELVE_HOURS_IN_MS) {
              return true;
            }
          }

          if (entryStartAbs >= targetEndAbs) {
            if ((entryStartAbs.getTime() - targetEndAbs.getTime()) < TWELVE_HOURS_IN_MS) {
              return true;
            }
          }
        }

        return false;
      }

      case 'NO_ER':
        const deptId = targetShift.departmentId || context.settings.department?.id;
        return context.settings.department?.type === 'ER';

      case 'PREGNANCY_RESTRICTION':
      case 'MEDICAL_RESTRICTION':
      case 'INFECTIOUS_AREA_RESTRICTION':
        return true;

      default:
        return true;
    }
  }
}
