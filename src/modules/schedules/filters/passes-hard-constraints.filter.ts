import { ScheduleSlot } from "../interfaces/schedule-slot-interface";
import { ScheduleContext } from "../interfaces/shedule-context-interface";
import { isWithinInterval, differenceInHours, isWeekend } from "date-fns";

export function passesHardConstraints(
    nurse: any, slot: ScheduleSlot, shiftInfo: any, state: NurseStateTracker, context: ScheduleContext
): boolean {

    // 1. Especialidad Obligatoria
    if (slot.requiredSpecialityId) {
        const hasSpeciality = nurse.specialities.some((s: any) => s.id === slot.requiredSpecialityId);
        if (!hasSpeciality) return false;
    }

    // 2. Disponibilidad (Vacaciones y Permisos)
    // Asumimos que blocks está mapeado para búsqueda rápida o iteramos
    const onVacation = context.blocks.vacations.some(v =>
        v.nurseId === nurse.id && isWithinInterval(slot.date, { start: v.startDate, end: v.endDate })
    );
    if (onVacation) return false;

    // 3Verificar ausencias médicas o permisos aprobados
    const onLeave = context.blocks.leaves.some(l =>
        l.nurseId === nurse.id && isWithinInterval(slot.date, { start: l.startDate, end: l.endDate })
    );
    if (onLeave) return false;

    // 4. Límites Físicos (Horas Máximas)
    const orgSettings = context.settings.organization;
    if (state.assignedHours + shiftInfo.durationHours > orgSettings.max_monthly_hours) {
        return false;
    }

    // 5. Descanso Obligatorio (Fatigue Settings)
    if (state.lastShiftEndTime) {
        // NOTA: slot.date debería combinarse con la hora de inicio del turno real
        const shiftStartTime = new Date(slot.date); // Simplificación
        const hoursRested = differenceInHours(shiftStartTime, state.lastShiftEndTime);
        if (hoursRested < orgSettings.minimum_rest_hours) {
            return false;
        }
    }

    // 6. Restricciones Personales Activas
    const restrictions = nurse.restrictions.map((r: any) => r.type);
    if (shiftInfo.isNightShift && restrictions.includes('NO_NIGHT_SHIFTS')) return false;
    if (isWeekend(slot.date) && restrictions.includes('NO_WEEKENDS')) return false;

    return true; // ✅ Sobrevivió al Filtro A
}