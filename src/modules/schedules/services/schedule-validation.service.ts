import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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




@Injectable()
export class ScheduleValidationService {
  constructor(private readonly prisma: PrismaService) { }



  /**
   * Orquestador Principal de Validación en Tiempo Real
   */
  async validateSingleAssignment(dto: ValidateAssignmentDto): Promise<SingleValidationResult> {
    const { nurseId, shiftId, date, entryId } = dto;
    const targetDate = new Date(date);

    // 🌟 TU PROPUESTA BLINDADA: 
    // Intentamos buscar si el shiftId enviado pertenece a un turno físico para extraer su plantilla base.
    // Si no se encuentra, asumimos que el Front ya nos envió directamente el ID de la plantilla base.
    const resolvedTemplate = await this.prisma.shiftTemplate.findFirst({
      where: {
        OR: [
          { id: shiftId }, // Escenario A: El Front envió directamente un ShiftTemplateId (Asignación nueva)
          { shifts: { some: { id: shiftId } } } // Escenario B: El Front envió un shiftId físico (Edición Inline)
        ]
      },
      select: { id: true }
    });


    // Control de seguridad por si envían un ID basura que no existe en ninguna tabla
    if (!resolvedTemplate) {
      throw new NotFoundException(`No template or clinical shift associated with the ID was found: ${shiftId}`);
    }


    // ==========================================================================
    // FASE A: RECOLECCIÓN DEL CONTEXTO ACTUAL (Fotografía del Mes en RAM)
    // ==========================================================================
    const context = await this.buildSingleNurseContext(nurseId, resolvedTemplate?.id, targetDate, entryId);

    const errors: string[] = [];
    const warnings: string[] = [];

    // --- Validación de Bloqueos Físicos/Legales Inmediatos ---
    // 1. Validar Vacaciones Aprobadas
    const isOnVacation = context.blocks.vacations.some(v =>
      targetDate >= new Date(v.start_Date) && targetDate <= new Date(v.end_Date)
    );

    if (isOnVacation) {
      errors.push(`The nurse is currently on approved vacation.`);
    }

    // 2. Validar Permisos o Licencias Médicas Activas
    const hasLeave = context.blocks.leaves.some(l =>
      targetDate >= new Date(l.startDate) && targetDate <= new Date(l.endDate)
    );
    if (hasLeave) {
      errors.push(`The nurse has an approved medical leave for this day.`);
    }

    // 3. Validar Restricciones Clínicas de Salud Ocupacional (Evaluador Inteligente)
    if (context.restrictions.length > 0) {
      for (const restriction of context.restrictions) {
        const type = restriction.restrictionType;
        if (!type) continue;

        // A. Verificar si el turno que se intenta asignar REALMENTE rompe esta restricción
        const isConflict = this.evaluateRestrictionConflict(type.name, context.targetShift, targetDate, context);

        if (isConflict) {
          // Formateamos un mensaje claro para el usuario
          const message = `${type.description || type.name}.`;

          // B. Enrutamiento de acción basado en la Severidad (PriorityTypes de tu esquema)
          switch (type.severity) {
            case 'CRITICAL':
            case 'URGENT':
            case 'HIGH':
              // Bloqueo Duro (Hard Block) - Evita que 'canAssign' sea true
              errors.push(`Medical Restriction: ${message}`);
              break;

            case 'MEDIUM':
            case 'LOW':
              // Advertencia (Soft Warning) - Permite guardar, pero alerta al supervisor
              warnings.push(`Profile Limitation: ${message}`);
              break;

            case 'INFO':
              // Registro Silencioso (Log)
              // Aquí NO hacemos un Prisma.create() para evitar spam en el modo "Live Validation".
              // Solo dejamos un rastro en el servidor. El guardado en la BD debe ocurrir en tu endpoint final de persistencia.
              console.log(`[SILENT LOG - INFO] Nurse ${nurseId} on ${date}: violated minor preference -> ${type.name}`);
              break;

            default:
              // Por seguridad clínica, si viene un nivel desconocido, lo tratamos como bloqueo.
              errors.push(`Active medical restriction: ${message}`);
              break;
          }
        }
      }
    }

    // ==========================================================================
    // 🌟 NUEVA VALIDACIÓN 4: DEPARTAMENTO CORRECTO Y CROSS-DEPARTMENTAL
    // ==========================================================================
    // Obtenemos el departamento al que pertenece la plantilla del turno que se quiere asignar
    const shiftDepartmentId = context.targetShift?.departmentId;
    const nurseDepartmentId = context.nurse?.departmentId;


    if (shiftDepartmentId && nurseDepartmentId && shiftDepartmentId !== nurseDepartmentId) {
      // Si los departamentos no coinciden, verificamos si tiene permitido el Cross Departmental
      // Nota: Adapta "allowCrossDepartment" al nombre exacto de la columna en tu modelo Nurse
      const canFloat = (context.nurse as any).allowCrossDepartment === true;

      if (!canFloat) {
        errors.push(
          `The nurse belongs to the department "${context.nurse?.department?.name || 'Original'}". ` +
          `Cross-departmental assignments are disabled for this staff profile.`
        );
      } else {
        // Si tiene permitido flotar, lo dejamos pasar pero emitimos un Warning informativo para el supervisor
        warnings.push(
          `Cross-departmental assignment: Nurse belongs to "${context.nurse?.department?.name || 'another department'}" ` +
          `but has permissions to cover this shift.`
        );
      }
    }

    if (errors.length > 0) {
      console.log("🛑 Bloqueando asignación en Fase A. Errores detectados:", errors);
      return {
        canAssign: false, // Forzado explícito
        errors: errors,
        warnings: warnings
      };
    }

    // ==========================================================================
    // 🌟 NUEVA VALIDACIÓN 5: SOLAPAMIENTO HORARIO / ESTAR EN DOS LUGARES A LA VEZ
    // ==========================================================================
    if (context.historicalEntries && context.historicalEntries.length > 0) {
      // 1. Extraemos las horas de inicio y fin de la plantilla que se intenta asignar AHORA
      const [candStartH, candStartM] = context.targetShift?.startTime?.split(':').map(Number) ?? [];
      const [candEndH, candEndM] = context.targetShift?.endTime?.split(':').map(Number) ?? [];

      const candidateStart = new Date(targetDate);
      candidateStart.setHours(candStartH, candStartM, 0, 0);

      let candidateEnd = new Date(targetDate);
      candidateEnd.setHours(candEndH, candEndM, 0, 0);


      console.log("La fecha y hora de inicio del turno evaluado es: " + candidateStart)
      console.log("La fecha y hora de final del turno evaluado es: " + candidateEnd)


      // Control para turnos que cruzan la medianoche (ej: Turno Nocturno 22:00 a 06:00 del día siguiente)
      if (candidateEnd <= candidateStart) {
        candidateEnd.setDate(candidateEnd.getDate() + 1);
      }

      // 2. Buscamos si ya tiene turnos guardados en la base de datos para ese mismo día que colisionen en horas
      for (const existingEntry of context.historicalEntries) {
        // Aseguramos comparar solo turnos del mismo día físico o colindantes
        if (isSameDay(new Date(existingEntry.date), targetDate)) {
          const shiftInfo = existingEntry.shift || existingEntry.shiftTemplate;
          if (!shiftInfo) continue;

          // 🌟 EXTRACCIÓN NATIVA: Al ser objetos Date, usamos los métodos de JavaScript directamente
          const startTimeDate = new Date(shiftInfo.startTime);
          const endTimeDate = new Date(shiftInfo.endTime);

          console.log("El tiempo de inicio del turno iterado es: " + startTimeDate)
          console.log("El tiempo de final del turno iterado es: " + endTimeDate)

          const existStartH = startTimeDate.getHours();
          const existStartM = startTimeDate.getMinutes();
          const existEndH = endTimeDate.getHours();
          const existEndM = endTimeDate.getMinutes();

          // Creamos los objetos de comparación basados en la fecha de la asignación guardada
          const existingStart = new Date(existingEntry.date);
          existingStart.setHours(existStartH, existStartM, 0, 0);

          let existingEnd = new Date(existingEntry.date);
          existingEnd.setHours(existEndH, existEndM, 0, 0);


          if (existingEnd <= existingStart) {
            existingEnd.setDate(existingEnd.getDate() + 1);
          }

          // 3. Algoritmo Geométrico de Intersección de Intervalos de Tiempo:
          // (InicioA < FinB) Y (FinA > InicioB) -> Existe solapamiento total o parcial
          const blocksOverlap = candidateStart < existingEnd && candidateEnd > existingStart;

          if (blocksOverlap) {
            // Formateadores rápidos para que los textos sigan viéndose limpios en el log de errores (Ej: "08:30")
            const formattedStart = `${String(existStartH).padStart(2, '0')}:${String(existStartM).padStart(2, '0')}`;
            const formattedEnd = `${String(existEndH).padStart(2, '0')}:${String(existEndM).padStart(2, '0')}`;

            errors.push(
              `Schedule Conflict: The nurse is already assigned to the shift "${shiftInfo.name}" ` +
              `(${formattedStart} - ${formattedEnd}) on this day. It is physically impossible to be in two places at once.`
            );
            break; // Con un solapamiento crítico es suficiente para abortar
          }
        }
      }
    }

    // Si ya encontramos bloqueos insalvables de disponibilidad, abortamos rápidamente
    if (errors.length > 0) {
      return { canAssign: false, errors, warnings };
    }

    // ==========================================================================
    // FASE B: INYECCIÓN VIRTUAL
    // ==========================================================================
    const { slots, state } = this.simulateTimeline(context, targetDate);

    // Encontramos el slot virtual específico dentro de la línea de tiempo mezclada
    const virtualSlot = slots.find(s =>
      s.shiftTemplateId === resolvedTemplate.id && isSameDay(s.date, targetDate)
    );

    // 🌟 SOLUCIÓN: Control de Tipo de Emergencia (Evita el "undefined")
    if (!virtualSlot) {
      throw new NotFoundException(
        `The simulated environment could not be structured for the assigned shift on the date ${targetDate.toISOString().split('T')[0]}.`
      );
    }

    // ==========================================================================
    // FASE C: EVALUACIÓN MEDIANTE TU RULE ENGINE EXISTENTE
    // ==========================================================================
    const rules = context.settings.rules; // Viene de la BD (WorkRule)

    // Creamos un arreglo específico para los errores del motor de reglas
    const ruleErrors: string[] = [];

    // Formateamos un clon del objeto global ScheduleContext para que tus evaluadores no fallen por falta de propiedades
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
      // Invocamos tu evaluador nativo reutilizando toda tu infraestructura del motor automático
      const result = evaluateHardRule(rule, context.nurse, cleanSlot, state, mockScheduleContext);

      if (!result.isValid) {
        const message = result.reason || `Violation of the business rule: ${rule.name}`;

        if (rule.type === 'HARD') {
          // Bloquea por completo el botón guardar (Ej: rompe el límite estricto de horas o descanso de 12h)
          ruleErrors.push(`[Critical] ${message}`);
        } else if (rule.type === 'SOFT') {
          // Alertas visuales color ámbar (Ej: sobrecarga de equidad, preferencia de turno no deseada)
          warnings.push(`[Warning] ${message}`);
        }
      }
    }

    const finalErrors = [...errors, ...ruleErrors];
    return {
      // 🌟 Control absoluto: Solo es asegurable si el total de errores acumulados es exactamente 0
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
    // 1. Calcular fronteras de tiempo exactas
    const startOfCurrentMonth = startOfMonth(targetDate);
    const endOfCurrentMonth = endOfMonth(targetDate);
    const sixDaysAgo = subDays(startOfCurrentMonth, 6);

    // Verificar existencia de la enfermera y traer su organización/departamento primario
    const nurse = await this.prisma.nurse.findUnique({
      where: { id: nurseId },
      include: { department: true }
    });

    if (!nurse) {
      throw new NotFoundException(`Nurse with ID ${nurseId} not found.`);
    }

    const organizationId = nurse.organizationId;
    const departmentId = nurse.departmentId;

    // 2. Disparar consultas concurrentes optimizadas a la Base de Datos
    const [
      activeRules,
      globalSettings, // 🌟 NUEVA PIEZA: Configuraciones globales del sistema extraídas
      departmentSettings,
      vacations,
      leaves,
      restrictions,
      historicalEntries,
      simulatedShiftInfo
    ] = await Promise.all([
      // Reglas de negocio activas
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

      // 🌟 ¡AÑADIDO! Traer los parámetros globales del hospital (SystemConfiguration)
      this.prisma.systemConfiguration.findMany({
        // Si tus configuraciones no están ligadas a una organización, puedes remover el where o ajustarlo según tu esquema
      }),

      // Configuración del departamento (límites de horas, etc.)
      this.prisma.department.findUnique({
        where: { id: departmentId },
      }),

      // Vacaciones que colisionen con el mes analizado
      this.prisma.vacation.findMany({
        where: {
          nurseId,
          status: 'APPROVED',
          OR: [
            { start_Date: { lte: endOfCurrentMonth }, end_Date: { gte: startOfCurrentMonth } }
          ]
        }
      }),

      // Licencias médicas/Permisos aprobados
      this.prisma.leave.findMany({
        where: {
          userId: nurseId,
          status: 'APPROVED',
          OR: [
            { startDate: { lte: endOfCurrentMonth }, endDate: { gte: startOfCurrentMonth } }
          ]
        }
      }),

      // Restricciones del perfil vigentes
      this.prisma.nurseRestriction.findMany({
        where: { nurseId, isActive: true },
        include: { restrictionType: true }
      }),

      // Historial de turnos ya calendarizados
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

      // Información del turno que se desea asignar
      this.prisma.shiftTemplate.findUnique({
        where: { id: shiftId }
      })
    ]);

    // 3. Retornar el mapa consolidado en memoria RAM incluyendo la configuración global
    return {
      nurse,
      targetShift: simulatedShiftInfo,
      settings: {
        global: globalSettings, // 🌟 Estructura homóloga a la que usa tu motor automático
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


  //  * FASE B: Adapta el historial de la BD e inyecta virtualmente el nuevo turno en la línea de tiempo
  private simulateTimeline(context: any, targetDate: Date): { slots: IndividualScheduleSlot[], state: IndividualNurseStateTracker } {
    const { historicalEntries, targetShift, nurse } = context;

    // 1. Mapear los registros reales de la BD a la interfaz IndividualScheduleSlot
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


    // 2. Crear el Slot Virtual del turno que el supervisor intenta asignar/modificar
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

    // 3. Inyectar en memoria mezclando el historial real con el virtual, ordenado cronológicamente
    const simulatedSlots = [...realSlots, virtualSlot].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    // 4. Calcular el acumulador matemático acumulado (IndividualNurseStateTracker) hasta justo antes del turno virtual
    const state: IndividualNurseStateTracker = this.calculateNurseState(simulatedSlots, nurse.id, targetDate);

    return {
      slots: simulatedSlots,
      state
    };
  }

  /**
   * Generador analítico rápido del estado del enfermero (Horas acumuladas, días consecutivos, etc.)
   */
  private calculateNurseState(slots: IndividualScheduleSlot[], nurseId: string, targetDate: Date): IndividualNurseStateTracker {
    let assignedHours = 0;
    let consecutiveDaysWorked = 0;
    let consecutiveNightsWorked = 0;
    let lastShiftEndTime: Date | null = null;
    let wasLastShiftNight = false;

    // Recorremos los turnos en orden cronológico previo para computar las variables dinámicas
    for (const slot of slots) {
      // Si llegamos al turno objetivo, paramos el análisis acumulativo para ver cómo llega la enfermera a ese día
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

      // Calcular días consecutivos lógicos
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

      // Guardar referencia del fin del último turno procesado
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
    /*
    |--------------------------------------------------------------------------
    | 1. CARGA DE CONFIGURACIONES SISTÉMICAS (De tu schema.prisma)
    |--------------------------------------------------------------------------
    */
    const configs = await this.prisma.systemConfiguration.findMany();
    const configMap = new Map(configs.map((c) => [c.key, c.value]));

    const maxMonthlyHours = Number(configMap.get(SystemConfigurationKeys.MAX_MONTHLY_HOURS) || 160);
    const minRestHours = Number(configMap.get(SystemConfigurationKeys.MIN_REST_HOURS) || 12);
    const maxConsecutiveNights = Number(configMap.get(SystemConfigurationKeys.MAX_CONSECUTIVE_NIGHTS) || 3);

    /*
    |--------------------------------------------------------------------------
    | 2. RECOPIILACIÓN DEL CUADRANTE Y SUS RELACIONES COMPLETA
    |--------------------------------------------------------------------------
    */
    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        scheduleEntries: { // Nota: en tu schema se mapea como 'entries' en el modelo Schedule
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

    /*
    |--------------------------------------------------------------------------
    | 🟢 NUEVA VALIDACIÓN: IMPEDIR PUBLICACIÓN SI EXISTEN SLOTS VACANTES
    |--------------------------------------------------------------------------
    | Recorremos las entradas buscando registros donde el 'nurseId' esté vacío.
    | Si hay vacantes, disparamos un fallo preventivo inmediato con el conteo.
    */
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

    /*
    |--------------------------------------------------------------------------
    | 3. VALIDACIÓN: RESTRICCIÓN DE PERSONAL MÍNIMO POR DEPARTAMENTO / TURNO
    |--------------------------------------------------------------------------
    | Verifica que cada ShiftTemplate (ej: Emergencias - Mañana) tenga el personal 
    | requerido (minStaffRequired) asignado en el periodo del cuadrante.
    |--------------------------------------------------------------------------
    */
    const templateCoverage = new Map<string, { assigned: number; required: number; name: string }>();

    for (const entry of schedule.scheduleEntries) {
      if (entry.shiftTemplate) {
        const tId = entry.shiftTemplate.id;
        const current = templateCoverage.get(tId) || {
          assigned: 0,
          required: entry.shiftTemplate.minimum_staff,
          name: entry.shiftTemplate.name,
        };
        // Contamos la asignación si no está vacante (tiene nurseId)
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

    /*
    |--------------------------------------------------------------------------
    | 4. VALIDACIONES CRÍTICAS POR ENFERMERO (Agrupación de Líneas de Tiempo)
    |--------------------------------------------------------------------------
    */
    // Agrupamos las entradas por cada enfermero asignado
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

      // Ordenamos cronológicamente por hora de inicio del turno
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

        // A. COMPROBACIÓN: Horas Consecutivas Nocturnas (Fatiga)
        if (current.shift.type === "NIGHT") {
          consecutiveNightsCount++;
          if (consecutiveNightsCount > maxConsecutiveNights) {
            errors.push(
              `Fatigue Risk: ${nurseName} exceeds the regulatory limit of ${maxConsecutiveNights} consecutive nights of work.`
            );
          }
        } else {
          consecutiveNightsCount = 0; // Se rompe la racha nocturna
        }

        // B. COMPROBACIONES INTER-TURNO (Comparación con el turno inmediatamente siguiente)
        if (i < sortedEntries.length - 1) {
          const next = sortedEntries[i + 1];
          if (!next.shift) continue;

          const nextStart = new Date(next.shift.startTime);
          const nextEnd = new Date(next.shift.endTime);

          // 🚨 SUPERPOSICIÓN DE HORARIOS (Overlapping Shifts)
          if (isBefore(nextStart, currentEnd)) {
            errors.push(
              `Time Conflict (Overlap): ${nurseName} is assigned the shift [${current.shift.type}] that ends at ${currentEnd.toLocaleTimeString()} and the shift [${next.shift.type}] that starts earlier (${nextStart.toLocaleTimeString()}) on the same day.`
            );
          }

          // 🛌 MITIGACIÓN DE FATIGA: Descanso Mínimo Obligatorio entre Jornadas
          const restHoursBetween = differenceInHours(nextStart, currentEnd);
          if (isAfter(nextStart, currentEnd) && restHoursBetween < minRestHours) {
            errors.push(
              `Rest Violation: ${nurseName} ends her shift at ${currentEnd.toLocaleString()} and her next shift starts in less than the ${minRestHours} minimum mandatory rest hours (Actual time: ${restHoursBetween}h).`
            );
          }
        }
      }

      // C. COMPROBACIÓN: Límite Máximo de Horas Laborales al Mes
      if (totalNurseHours > maxMonthlyHours) {
        errors.push(
          `Excessive Workload: ${nurseName} accumulates a total of ${totalNurseHours} hours in this quadrant, exceeding the configured institutional limit of ${maxMonthlyHours} monthly hours.`
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | 5. DICTAMEN FINAL DEL MOTOR DE REGLAS
    |--------------------------------------------------------------------------
    */
    if (errors.length > 0) {
      throw new BadRequestException({
        message: "El cuadrante no cumple con los requisitos de seguridad operacional y médica para ser publicado.",
        errors, // Pasamos el array de errores detallados para listarlos en el Toast del Frontend
      });
    }

    return {
      valid: true,
    };
  }

  async validateAssignment(nurseId: string, date: Date, shiftId: string) {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // 1. Verificar Restricciones Activas (Tu módulo anterior)
    const restrictions = await this.prisma.nurseRestriction.findMany({
      where: { nurseId, isActive: true },
      include: { restrictionType: true }
    });

    // 2. Horas acumuladas en el mes
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const monthlyHours = await this.prisma.scheduleEntry.aggregate({
      where: { nurseId, date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { /* lógica de sumar duración de shifts */ }
    });

    // 3. Descanso mínimo (Ej: ¿Tiene turno en las últimas 12 horas?)
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

  /**
   * 🧠 ESTRATEGIA DE RESTRICCIONES:
   * Evalúa dinámicamente si el turno candidato viola la restricción específica de la enfermera.
   */
  private evaluateRestrictionConflict(
    restrictionName: string,
    targetShift: any,
    targetDate: Date,
    context: any
  ): boolean {

    switch (restrictionName) {
      // --- RESTRICCIONES DE HORARIO ---
      case 'NO_NIGHT_SHIFTS':
        return targetShift.isNightShift === true;

      case 'ONLY_NIGHT_SHIFTS':
        return targetShift.isNightShift === false;

      case 'ONLY_DAY_SHIFTS':
      case 'ONLY_MORNING_SHIFTS':
        // Ejemplo asumiendo que tu enum ShiftType tiene "MORNING" o "FULL_DAY"
        return targetShift.name !== 'MORNING' && targetShift.name !== 'FULL_DAY';

      // --- RESTRICCIONES DE DÍAS Y CALENDARIO ---
      case 'NO_WEEKENDS':
        const dayOfWeek = targetDate.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Domingo, 6 = Sábado

      case 'WEEKENDS_ONLY':
        const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6;
        return !isWeekend;

      // --- RESTRICCIONES DE FATIGA Y CONSECUTIVIDAD ---
      case 'NO_DOUBLE_SHIFTS':
        // Evaluamos si en el historial ya existe un turno asignado EXACTAMENTE en la misma fecha
        const shiftsThatDay = context.historicalEntries.filter((entry: any) =>
          isSameDay(new Date(entry.date), targetDate)
        );
        return shiftsThatDay.length > 0;

      // --- RESTRICCIONES DE CARGA Y DEPARTAMENTO ---
      case 'PART_TIME_ONLY':
      case 'MAX_8_HOURS_DAY':
        return targetShift.durationHours > 8;

      // ==========================================
      // 🌟 CONDICIÓN 1: MÁXIMO 40 HORAS SEMANALES
      // ==========================================
      case 'MAX_40_HOURS_WEEK': {
        if (!targetShift?.durationHours) return false;

        // Determinar el rango de la semana (Lunes a Domingo) para la fecha objetivo
        const currentDay = targetDate.getDay();
        const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1; // Ajustar si es Domingo (0)

        const mondayOfWeek = new Date(targetDate);
        mondayOfWeek.setDate(targetDate.getDate() - distanceToMonday);
        mondayOfWeek.setHours(0, 0, 0, 0);

        const sundayOfWeek = new Date(mondayOfWeek);
        sundayOfWeek.setDate(mondayOfWeek.getDate() + 6);
        sundayOfWeek.setHours(23, 59, 59, 999);

        // Sumar las horas de los turnos ya asignados dentro de esa misma semana
        const weeklyHoursAlreadyAssigned = context.historicalEntries
          .filter((entry: any) => {
            const entryDate = new Date(entry.date);
            return entryDate >= mondayOfWeek && entryDate <= sundayOfWeek && entry.shift?.durationHours;
          })
          .reduce((sum: number, entry: any) => sum + Number(entry.shift.durationHours), 0);

        // Conflicto si: Horas actuales + Horas del nuevo turno > 40
        return (weeklyHoursAlreadyAssigned + Number(targetShift.durationHours)) > 40;
      }

      // ==========================================
      // 🌟 CONDICIÓN 2: DESCANSO MÍNIMO DE 12 HORAS
      // ==========================================
      case 'NO_OVERTIME': {
        if (!targetShift?.startTime || !targetShift?.endTime) return false;

        // Construimos las fechas/horas absolutas del turno que se intenta asignar
        const targetStartStr = targetShift.startTime.split('T')[1] || '00:00:00';
        const targetEndStr = targetShift.endTime.split('T')[1] || '00:00:00';

        const targetStartAbs = new Date(targetDate);
        const [sH, sM] = targetStartStr.split(':').map(Number);
        targetStartAbs.setHours(sH, sM, 0, 0);

        const targetEndAbs = new Date(targetDate);
        const [eH, eM] = targetEndStr.split(':').map(Number);
        targetEndAbs.setHours(eH, eM, 0, 0);

        // Si el turno termina al día siguiente (Turno nocturno)
        if (targetEndAbs < targetStartAbs) {
          targetEndAbs.setDate(targetEndAbs.getDate() + 1);
        }

        const TWELVE_HOURS_IN_MS = 12 * 60 * 60 * 60 * 1000;

        // Evaluamos contra TODOS los turnos ya existentes de la enfermera
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

          // Caso A: El turno existente fue ANTES del propuesto. 
          // (Inicio del nuevo turno - Fin del turno viejo debe ser >= 12 horas)
          if (targetStartAbs >= entryEndAbs) {
            if ((targetStartAbs.getTime() - entryEndAbs.getTime()) < TWELVE_HOURS_IN_MS) {
              return true; // Conflicto detectado: Descanso insuficiente
            }
          }

          // Caso B: El turno existente es DESPUÉS del propuesto.
          // (Inicio del turno viejo - Fin del nuevo turno debe ser >= 12 horas)
          if (entryStartAbs >= targetEndAbs) {
            if ((entryStartAbs.getTime() - targetEndAbs.getTime()) < TWELVE_HOURS_IN_MS) {
              return true; // Conflicto detectado: Descanso insuficiente
            }
          }
        }

        return false; // Pasó el control de las 12 horas perfectamente
      }

      case 'NO_ER':
        // Verifica si el turno que se intenta inyectar pertenece a emergencias
        const deptId = targetShift.departmentId || context.settings.department?.id;
        // Dependiendo de cómo traigas el department type, aquí verificarías si es ER
        return context.settings.department?.type === 'ER';

      // --- RESTRICCIONES MÉDICAS GLOBALES ---
      case 'PREGNANCY_RESTRICTION':
      case 'MEDICAL_RESTRICTION':
      case 'INFECTIOUS_AREA_RESTRICTION':
        // Estas restricciones suelen ser absolutas si están "activas", 
        // o requieren una evaluación más profunda de los flags del turno (Ej. requiresHeavyLifting).
        // Por defecto, si el bloque llegó hasta aquí y no hay regla específica, asumimos que APLICA el conflicto.
        return true;

      default:
        // Si añades una nueva restricción en el futuro y olvidas programarla aquí,
        // por defecto asumiremos que hay conflicto para obligar a implementarla y proteger a la enfermera.
        return true;
    }
  }
}
