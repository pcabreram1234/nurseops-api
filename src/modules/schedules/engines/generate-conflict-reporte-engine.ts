import { ScheduleSlot } from '../interfaces/schedule-slot-interface';
import { ShiftTemplate } from '@prisma/client';
import { AlertPayload } from '../interfaces/schedule-alert-payload-interface';

export function generateConflictReport(
    slots: ScheduleSlot[],
    shiftTemplates: ShiftTemplate[],
    scheduleId: string,
    departmentId: string
) {
    const alerts: AlertPayload[] = [];
    let totalConflicts = 0;

    // Escanear buscando ranuras sin asignar
    for (const slot of slots) {
        if (!slot.assignedNurseId) {
            totalConflicts++;
            const shiftInfo = shiftTemplates.find(s => s.id === slot.shiftTemplateId);

            // Determinar el tipo de alerta operativa
            let alertType: AlertPayload['type'] = 'STAFF_SHORTAGE';
            if (shiftInfo?.isNightShift) alertType = 'NO_NIGHT_COVERAGE';
            else if (slot.requiredSpecialityId) alertType = 'MISSING_SPECIALIST';

            alerts.push({
                scheduleId,
                departmentId,
                type: alertType,
                date: slot.date,
                message: `No se encontró personal disponible para el turno ${shiftInfo?.name}.`
            });
        }
    }

    return {
        alerts,
        hasConflicts: totalConflicts > 0,
        totalConflicts
    };
}