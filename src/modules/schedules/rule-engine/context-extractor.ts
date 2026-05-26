import { ScheduleSlot } from "../interfaces/schedule-slot-interface";
import { NurseStateTracker } from "@modules/nurses/interfaces/nurse-state-tracker-interface";
import { ScheduleContext } from "../interfaces/shedule-context-interface";
import { differenceInHours } from 'date-fns';
import { WorkRuleConditions } from "@prisma/client";
// rule-engine/context-extractor.ts
export function getRuntimeValue(
    condition: WorkRuleConditions,
    nurse: any,
    slot: ScheduleSlot, // Tipo ScheduleSlot
    state: NurseStateTracker, // Tipo NurseStateTracker
    context: ScheduleContext // Tipo ScheduleContext
): any {
    switch (condition.condition_type) {
        case 'TOTAL_HOURS':
            return state.assignedHours || 0;

        case 'CONSECUTIVE_DAYS':
            return state.consecutiveDaysWorked || 0;

        case 'CONSECUTIVE_NIGHTS':
            return state.consecutiveNightsWorked || 0;

        case 'REST_HOURS':
            if (!state.lastShiftEndTime) return 999; // Si no ha trabajado, su descanso es infinito
            return calculateDifferenceInHours(slot.date, state.lastShiftEndTime);

        case 'IS_ON_VACATION':
            // Buscas en la RAM si la fecha del slot actual coincide con las vacaciones de la enfermera
            const candidateDate = new Date(slot.date);
            const onVacation = context.blocks.vacations.some(v =>
                v.nurseId === nurse.id &&
                candidateDate >= new Date(v.startDate) &&
                candidateDate <= new Date(v.endDate)
            );
            return onVacation ? 'true' : 'false';

        case 'ILLEGAL_SHIFT_TRANSITION':
            // Tu validación de Noche -> Mañana
            if (!state.lastShiftEndTime || !state.wasLastShiftNight) return 'false';
            const isMorning = slot.shiftInfo?.type?.toLowerCase().includes('morning');
            if (isMorning && calculateDifferenceInHours(slot.date, state.lastShiftEndTime) < 12) {
                return 'true'; // Activa la condición -> Dispara REJECT_NURSE
            }
            return 'false';

        case 'ADMIN_INTERACTION_REQUIRED':
        default:
            return 'false'; // Las reglas administrativas nunca devuelven true automáticamente
    }
}



/**
 * Calcula la diferencia en horas entre dos fechas.
 * @param shiftStartDate La fecha/hora de inicio del turno actual que se está evaluando.
 * @param lastShiftEndDate La fecha/hora de fin del último turno trabajado.
 * @returns Número de horas de diferencia.
 */
export function calculateDifferenceInHours(shiftStartDate: Date | string, lastShiftEndDate: Date | string): number {
    const start = new Date(shiftStartDate);
    const end = new Date(lastShiftEndDate);

    // date-fns calcula (fecha1 - fecha2), por lo que pasamos la más reciente primero
    return differenceInHours(start, end);
}