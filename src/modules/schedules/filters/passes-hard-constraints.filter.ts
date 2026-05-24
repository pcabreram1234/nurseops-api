import { ScheduleSlot } from "../interfaces/schedule-slot-interface";
import { ScheduleContext } from "../interfaces/shedule-context-interface";
import { isWithinInterval, differenceInHours, isWeekend } from "date-fns";
import { NurseStateTracker } from "@modules/nurses/interfaces/nurse-state-tracker-interface";

export function passesHardConstraints(
    nurse: any, slot: ScheduleSlot, shiftInfo: any, state: NurseStateTracker, context: ScheduleContext
): boolean {

    if (nurse.departmentId !== context.settings.department.id
        && !nurse.isCrossDepartmental) {
        return false;
    }

    // 2. Especialidad (Mejorado para logs y robustez)
    if (slot.requiredSpecialityId) {
        if (nurse.speciality?.id !== slot.requiredSpecialityId) {
            console.log(`[Filter] Rejected ${nurse.id}: Speciality mismatch.`);
            return false;
        }
    }


    // 3. Disponibilidad (Vacaciones y Permisos)
    // Usamos .some() para verificar si la enfermera está bloqueada
    const isBlocked = context.blocks.vacations.some(v => v.nurseId === nurse.id && isWithinInterval(slot.date, { start: v.start_Date, end: v.end_Date })) ||
        context.blocks.leaves.some(l => l.nurseId === nurse.id && isWithinInterval(slot.date, { start: l.startDate, end: l.endDate }));

    if (isBlocked) return false;


    // 4. Límites Físicos (Horas)
    // Asegura que shiftInfo tenga durationHours, si no, usa un default para evitar errores
    const duration = shiftInfo?.durationHours || 8;
    if (state.assignedHours + duration > context.settings.organization.max_monthly_hours) {
        console.log(`[Filter] Rejected ${nurse.id}: Max monthly hours reached.`);
        return false;
    }



    // 5. Descanso Obligatorio (Fatigue Settings)
    if (state.lastShiftEndTime) {
        const shiftStartTime = new Date(slot.date);
        const hoursRested = differenceInHours(shiftStartTime, state.lastShiftEndTime);
        if (hoursRested < context.settings.organization.minimum_rest_hours) {
            return false;
        }
    }

    // 6. Restricciones Personales Activas
    // (Corregido: El array se llama nurseRestrictions en Prisma)
    // Nota: Revisa si guardas el tipo como string directo o si es un ID hacia NurseRestrictionType
    if (nurse.nurseRestrictions && nurse.nurseRestrictions.length > 0) {

        // Mapeamos los nombres de las restricciones (Ajusta 'r.type' por el campo real donde guardas el Enum, ej: r.restrictionType?.name)
        const restrictionCodes = nurse.nurseRestrictions.map((r: any) => r.type);

        if (shiftInfo?.isNightShift && restrictionCodes.includes('NO_NIGHT_SHIFTS')) return false;
        if (isWeekend(slot.date) && restrictionCodes.includes('NO_WEEKENDS')) return false;
    }

    return true; // ✅ Sobrevivió al Filtro A
}