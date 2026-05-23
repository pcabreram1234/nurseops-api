import { ScheduleSlot } from '../interfaces/schedule-slot-interface';
import { ScheduleContext } from '../interfaces/shedule-context-interface';
import { ShiftTemplate } from '@prisma/client';
import { passesHardConstraints } from '../filters/passes-hard-constraints.filter';
import { calculateOptimizationScore } from '../filters/calculate-optimization-score-filter';
import { addDays, differenceInCalendarDays } from 'date-fns';
import { NurseStateTracker } from "../../nurses/interfaces/nurse-state-tracker-interface"
import { EngineMetrics } from '../interfaces/schedule-engine-metrics';

export function runAssignmentLoop(
    slots: ScheduleSlot[],
    context: ScheduleContext,
    shiftTemplates: ShiftTemplate[] // Asumiendo que ahora incluye durationHours, isNight, etc.
): { slots: ScheduleSlot[], metrics: EngineMetrics } {

    // 1. Inicializar el Tracker para todas las enfermeras
    const nurseStates = new Map<string, NurseStateTracker>();
    for (const nurse of context.nurses) {
        nurseStates.set(nurse.id, {
            assignedHours: 0,
            assignedNights: 0,
            consecutiveDaysWorked: 0,
            lastShiftEndTime: null,
            lastWorkedDate: null
        });
    }

    // 2. Iteración Cronológica: Recorrer cada ranura vacía
    for (const slot of slots) {
        if (slot.assignedNurseId) continue; // Ya fue llenada (seguridad)

        const shiftInfo = shiftTemplates.find(s => s.id === slot.shiftId);
        if (!shiftInfo) continue;

        let bestCandidateId: string | null = null;
        let highestScore = -Infinity;

        // 3. Evaluar a cada enfermera del universo
        for (const nurse of context.nurses) {
            const state = nurseStates.get(nurse.id)!;

            // ==========================================
            // FILTRO A: Restricciones Estrictas (Hard Constraints)
            // ==========================================
            if (!passesHardConstraints(nurse, slot, shiftInfo, state, context)) {
                continue; // ❌ Descartada inmediatamente para este turno
            }

            // ==========================================
            // FILTRO B: Puntuación (Soft Constraints)
            // ==========================================
            const score = calculateOptimizationScore(nurse, slot, shiftInfo, state, context);

            // Determinar si es la mejor hasta ahora
            if (score > highestScore) {
                highestScore = score;
                bestCandidateId = nurse.id;
            }
        }

        // 4. Asignación y Actualización de Estado
        if (bestCandidateId) {
            slot.assignedNurseId = bestCandidateId;

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

            const currentShiftStart = new Date(slot.date);
            currentShiftStart.setHours(startH, startM, 0, 0);

            let currentShiftEnd = new Date(slot.date);
            currentShiftEnd.setHours(endH, endM, 0, 0);

            // Si la hora de fin es matemáticamente menor a la de inicio, cruzó la medianoche
            if (currentShiftEnd < currentShiftStart || shiftInfo.isNightShift) {
                currentShiftEnd = addDays(currentShiftEnd, 1);
            }

            // ==========================================
            // CÁLCULO DE DÍAS CONSECUTIVOS
            // ==========================================
            if (winningState.lastWorkedDate) {
                // ¿Cuántos días calendario pasaron desde su último inicio de turno?
                const daysDiff = differenceInCalendarDays(slot.date, winningState.lastWorkedDate);

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

            // ==========================================
            // ACTUALIZAR RASTREADOR PARA EL SIGUIENTE SLOT
            // ==========================================
            winningState.lastShiftEndTime = currentShiftEnd;
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