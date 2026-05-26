import { ScheduleSlot } from '../interfaces/schedule-slot-interface';
import { ScheduleContext } from '../interfaces/shedule-context-interface';
import { ShiftTemplate } from '@prisma/client';
import { addDays, differenceInCalendarDays } from 'date-fns';
import { NurseStateTracker } from "../../nurses/interfaces/nurse-state-tracker-interface"
import { EngineMetrics } from '../interfaces/schedule-engine-metrics';
import { evaluateHardRule } from '../rule-engine/evaluators';
import { evaluateSoftRule } from '../rule-engine/evaluators';

export function runAssignmentLoop(
    slots: ScheduleSlot[],
    context: ScheduleContext,
    shiftTemplates: ShiftTemplate[],
    departmentId: string // Asumiendo que ahora incluye durationHours, isNight, etc.
): { slots: ScheduleSlot[], metrics: EngineMetrics } {

    // 1. Inicializar el Tracker para todas las enfermeras
    const nurseStates = new Map<string, NurseStateTracker>();
    for (const nurse of context.nurses) {
        nurseStates.set(nurse.id, {
            assignedHours: 0,
            assignedNights: 0,
            consecutiveDaysWorked: 0,
            lastShiftEndTime: null,
            lastWorkedDate: null,
            consecutiveNightsWorked: 0,
            weekendsWorked: 0,
            wasLastShiftNight: false,
        });
    }

    // 🚀 COCCIÓN DEL HISTORIAL: Alimentar el tracker con el cierre del mes anterior
    if (context.historicalSlots && context.historicalSlots.length > 0) {
        for (const pastSlot of context.historicalSlots) {
            const nurseId = pastSlot.assignedNurseId;
            const state = nurseStates.get(nurseId);

            if (!state) continue; // Si la enfermera ya no está activa en este departamento, la ignoras

            // Reutilizamos exactamente la misma lógica matemática de rachas que ya programaste:
            if (state.lastWorkedDate) {
                const daysDiff = differenceInCalendarDays(pastSlot.date, state.lastWorkedDate);
                if (daysDiff === 1) {
                    state.consecutiveDaysWorked += 1;
                } else if (daysDiff > 1) {
                    state.consecutiveDaysWorked = 1;
                }
            } else {
                state.consecutiveDaysWorked = 1;
            }

            // Guardamos sus últimos tiempos de salida del mes pasado
            state.lastWorkedDate = pastSlot.date;

            // Calculamos la hora exacta de fin del turno usando los strings de tu base de datos (ej: "07:00")
            const [endH, endM] = pastSlot.shiftTemplate.endTime.split(':').map(Number);
            const endTime = new Date(pastSlot.date);
            endTime.setHours(endH, endM, 0, 0);

            // Si el turno terminaba al día siguiente (turno noche), sumamos el día correspondiente
            if (pastSlot.shiftTemplate.isNightShift) {
                endTime.setDate(endTime.getDate() + 1);
                state.consecutiveNightsWorked += 1;
            } else {
                state.consecutiveNightsWorked = 0; // Se rompe la racha de noches
            }

            state.lastShiftEndTime = endTime;
        }
    }

    // 2. Iteración Cronológica: Recorrer cada ranura vacía
    for (const slot of slots) {
        if (slot.assignedNurseId) continue; // Ya fue llenada (seguridad)

        const shiftInfo = shiftTemplates.find(s => s.id === slot.shiftTemplateId);
        if (!shiftInfo) continue;

        let bestCandidateId: string | null = null;
        let highestScore = -Infinity;

        // 3. Evaluar a cada enfermera del universo
        for (const nurse of context.nurses) {

            // ¿Esta enfermera es del depatamento a asignar o tiene permitido ir a otro departamento?
            if (nurse.departmentId !== departmentId && !nurse.isCrossDepartmental) {
                continue; // Esta enfermera no puede entrar aquí
            }

            // 1. ¿Esta enfermera ya tiene turno este día?
            const alreadyWorking = slots.some(s =>
                s.date.getTime() === slot.date.getTime() &&
                s.assignedNurseId === nurse.id
            );

            if (alreadyWorking) continue; // Si ya tiene turno hoy, salta a la siguiente

            const state = nurseStates.get(nurse.id)!; // Lo sacamos aquí para pasarlo a los evaluadore

            // ==========================================
            // REGLA CERO: FÍSICA Y SOLAPAMIENTO (Seguridad Base)
            // ==========================================
            // Calculamos cuándo empieza ESTE turno
            const [startH, startM] = shiftInfo.startTime.split(':').map(Number);
            const currentShiftStart = new Date(slot.date);
            currentShiftStart.setHours(startH, startM, 0, 0);

            // // 1. ¿Está intentando empezar este turno ANTES de que termine su turno anterior? (Solapamiento)
            if (state.lastShiftEndTime && state.lastShiftEndTime > currentShiftStart) {
                continue; // ❌ Descartada (Físicamente imposible)
            }

            // // 2. ¿Ya tiene un turno asignado para ESTE MISMO DÍA? (Previene turnos dobles por error)
            if (state.lastWorkedDate && state.lastWorkedDate.getTime() === slot.date.getTime()) {
                continue; // ❌ Descartada (Solo 1 turno por día calendario por defecto)
                // Nota: Si en tu hospital permiten turnos dobles, puedes comentar esta validación.
            }

            // FASE 2: EL MURO (Hard Rules) - ¡Fast Fail!
            let passedHardRules = true;
            for (const rule of context.engineRules.hard) {
                const ruleValidation = evaluateHardRule(rule, nurse, slot, state, context);
                if (!ruleValidation.isValid) {
                    passedHardRules = false;
                    break; // 🛑 Detiene la evaluación de esta enfermera inmediatamente
                }
            }

            if (!passedHardRules) continue; // Pasa a la siguiente enfermera candidata

            // ==========================================
            // FASE 3: LA PUNTUACIÓN Y EQUIDAD (Soft Rules)
            // ==========================================

            // 💡 EL TRUCO DE EQUIDAD: El puntaje base ya NO es 100 estático. 
            // Empezamos restándole las horas que ya tiene asignadas. 
            // Así, la enfermera con menos horas siempre tendrá un puntaje base más alto.
            let candidateScore = 1000 - (state.assignedHours * 2); // Penalidad natural por fatiga

            // Añadimos pequeña aleatoriedad (0 a 5 puntos) para romper empates exactos
            // y no asignar siempre por orden alfabético
            candidateScore += Math.floor(Math.random() * 5);

            // Aplicamos las reglas de la base de datos
            for (const rule of context.engineRules.soft) {
                candidateScore += evaluateSoftRule(rule, nurse, slot, state, context);
            }

            // Seleccionar a la mejor
            if (candidateScore > highestScore) {
                highestScore = candidateScore;
                bestCandidateId = nurse.id;
            }
        }

        // 4. Asignación y Actualización de Estado
        if (bestCandidateId) {
            slot.assignedNurseId = bestCandidateId;
            // console.log(`Slot ${slot.id} asignado a enfermera ${bestCandidateId}`);

            const winningState = nurseStates.get(bestCandidateId)!;

            // 1. Sumar totales mensuales
            winningState.assignedHours += shiftInfo.durationHours;
            if (shiftInfo.isNightShift) winningState.assignedNights += 1;

            // ==========================================
            // CÁLCULO DE HORAS REALES (Cruce de medianoche)
            // ==========================================
            // Asumimos que startTime y endTime vienen como strings "HH:mm" (ej. "08:00", "22:00")
            const [startH, startM] = shiftInfo.startTime.split(':').map(Number);
            const [endH, endM] = shiftInfo.endTime.split(':').map(Number);

            const currentShiftStart = new Date(slot.shiftInfo.startTime);
            currentShiftStart.setHours(startH, startM, 0, 0);

            let currentShiftEnd = new Date(slot.shiftInfo.endTime);
            currentShiftEnd.setHours(endH, endM, 0, 0);

            // Si la hora de fin es matemáticamente menor a la de inicio, cruzó la medianoche
            if (currentShiftEnd < currentShiftStart || shiftInfo.isNightShift) {
                currentShiftEnd = addDays(currentShiftEnd, 1);
            }


            // ==========================================
            // CÁLCULO DE DÍAS CONSECUTIVOS
            // ==========================================
            let daysDiff = 0;
            if (winningState.lastWorkedDate) {
                // ¿Cuántos días calendario pasaron desde su último inicio de turno?
                daysDiff = differenceInCalendarDays(slot.date, winningState.lastWorkedDate);

                if (daysDiff === 1) {
                    // Trabajó ayer, la racha continúa
                    winningState.consecutiveDaysWorked += 1;
                } else if (daysDiff > 1) {
                    // Hubo al menos 1 día libre de por medio, la racha se resetea
                    winningState.consecutiveDaysWorked = 1;
                }
                // Nota: Si daysDiff === 0, significa que se le asignó otro turno el MISMO día.
                // La racha no sube ni se rompe, se queda igual.
            } else {
                // Es su primer turno asignado en esta ejecución
                winningState.consecutiveDaysWorked = 1;
            }

            // ========================================================
            // NUEVA LÓGICA PARA FINES DE SEMANA (Control de duplicados)
            // ========================================================
            const currentDayOfWeek = new Date(slot.date).getDay(); // 0 = Domingo, 6 = Sábado
            const isSaturday = currentDayOfWeek === 6;
            const isSunday = currentDayOfWeek === 0;

            if (isSaturday || isSunday) {
                let alreadyContabilizedThisWeekend = false;

                if (winningState.lastWorkedDate) {
                    // Caso A: Es el mismo día (ej. trabajó Mañana y le asignan Noche el mismo Sábado/Domingo)
                    if (daysDiff === 0) {
                        alreadyContabilizedThisWeekend = true;
                    }

                    // Caso B: Es Domingo y ya trabajó ayer Sábado (daysDiff === 1). El fin de semana ya se contó ayer.
                    if (isSunday && daysDiff === 1) {
                        alreadyContabilizedThisWeekend = true;
                    }
                }

                // Si es un fin de semana nuevo para ella, incrementamos el contador global del mes
                if (!alreadyContabilizedThisWeekend) {
                    winningState.weekendsWorked += 1;
                }
            }

            // ==========================================
            // ACTUALIZAR RASTREADOR PARA EL SIGUIENTE SLOT
            // ==========================================
            winningState.lastShiftEndTime = currentShiftEnd;
            winningState.wasLastShiftNight = shiftInfo.isNightShift;
            winningState.lastWorkedDate = slot.date;

        } else {
            console.warn(`⚠️ ALERTA: No se encontró candidato para el slot ${slot.id} en fecha ${slot.date}`);
            // Quedará en null. La UI luego mostrará esto como "Turno Descubierto / Open Shift"
        }
    }


    // ==========================================
    // 5. CÁLCULO DE MÉTRICAS DEL MOTOR (NUEVO)
    // ==========================================
    // Filtramos solo a las enfermeras que recibieron al menos 1 turno para no sesgar las métricas
    const activeNurses = Array.from(nurseStates.values()).filter(state => state.assignedHours > 0);

    let fairnessScore = 100;
    let fatigueScore = 0;

    if (activeNurses.length > 0) {
        let totalHours = 0;
        let totalNights = 0;
        let totalConsecutiveDays = 0;

        // Sumatoria global
        for (const state of activeNurses) {
            totalHours += state.assignedHours;
            totalNights += state.assignedNights;
            totalConsecutiveDays += state.consecutiveDaysWorked;
        }

        const avgHours = totalHours / activeNurses.length;

        // A. Calcular Equidad (Fairness) usando Desviación Media Absoluta
        let sumAbsoluteDeviation = 0;
        for (const state of activeNurses) {
            sumAbsoluteDeviation += Math.abs(state.assignedHours - avgHours);
        }
        const meanAbsoluteDeviation = sumAbsoluteDeviation / activeNurses.length;

        // Convertimos la desviación en un porcentaje restado de 100 (mientras más desviación, menor equidad)
        fairnessScore = Math.max(0, Math.round(100 - ((meanAbsoluteDeviation / (avgHours || 1)) * 100)));

        // B. Calcular Fatiga (Fatigue) como un índice compuesto
        // Asignamos "pesos" a lo que más cansa: Rachas consecutivas (ej. x10) y Noches (ej. x15)
        const avgConsecutiveDays = totalConsecutiveDays / activeNurses.length;
        const avgNights = totalNights / activeNurses.length;

        const rawFatigue = (avgConsecutiveDays * 10) + (avgNights * 15);
        fatigueScore = Math.min(100, Math.round(rawFatigue)); // Topeamos en 100% de fatiga
    }

    const metrics: EngineMetrics = {
        fairnessScore,
        fatigueScore
    };

    return { slots, metrics };
}