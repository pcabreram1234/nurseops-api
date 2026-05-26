import { ShiftTemplate, DepartmentSpeciality } from "@prisma/client";
import { ScheduleSlot } from "../interfaces/schedule-slot-interface";
import { startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { randomUUID } from "node:crypto";

export function buildDemandGrid(
    targetDate: Date,
    shiftTemplates: ShiftTemplate[],
    specialityRequirements: DepartmentSpeciality
): ScheduleSlot[] {
    const slots: ScheduleSlot[] = [];

    // 1. Obtener todos los días del mes
    const startDate = startOfMonth(targetDate);
    const endDate = endOfMonth(targetDate);
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

    console.log(`[Engine] Generating dashboard for ${daysInMonth.length} days...`);

    // 2. Recorrer cada día del mes
    for (const date of daysInMonth) {

        // 3. Por cada día, recorrer cada plantilla de turno (Mañana, Tarde, Noche)
        for (const shift of shiftTemplates) {

            let totalSlotsCreatedForShift = 0;

            const [startH, startM] = shift.startTime.split(':').map(Number);
            const currentShiftStartTime = new Date(date);
            currentShiftStartTime.setHours(startH, startM, 0, 0);

            const [endH, endM] = shift.endTime.split(':').map(Number);
            const currentShiftEndtime = new Date(date);
            currentShiftEndtime.setHours(endH, endM, 0, 0);

            const currentShiftInfo = {
                type: shift.name, // Ej: 'Noche', 'Mañana' (ajusta según tu DB)
                durationHours: (shift as any).duration_hours || 8, // Ajusta al campo real de tu DB
                isNightShift: (shift as any).is_night_shift || shift.name.toLowerCase().includes('NIGHT'),
                startTime: currentShiftStartTime, // Ajusta al campo real de tu DB
                endTime: currentShiftEndtime    // Ajusta al campo real de tu DB
            };

            // console.log(specialityRequirements);

            // Verificamos si el departamento del shift actual requiere o no una especialidad

            if (specialityRequirements.departmentId === shift.departmentId) {
                // 4. Inyectar primero los requerimientos de especialidad OBLIGATORIOS
                // Si el departamento exige 1 especialista de UCI en este turno, creamos esa ranura específica
                for (let i = 0; i < specialityRequirements.minimum_staff; i++) {
                    slots.push({
                        id: randomUUID(),
                        date: date,
                        shiftId: null,
                        shiftTemplateId: shift.id,
                        requiredSpecialityId: specialityRequirements.specialityId,
                        assignedNurseId: null, // Listo para ser llenado por el algoritmo
                        shiftInfo: currentShiftInfo,
                        generatedShiftId: ""
                    });
                    totalSlotsCreatedForShift++;
                }
            }



            // 5. Rellenar el resto de las ranuras hasta alcanzar el mínimo de personal (minimumStaff)
            // Ejemplo: Si se necesitan 3 personas en total, y ya creamos 1 ranura para UCI, faltan 2 genéricas.
            const remainingSlots = shift.minimum_staff - totalSlotsCreatedForShift;

            for (let i = 0; i < remainingSlots; i++) {
                slots.push({
                    id: randomUUID(),
                    date: date,
                    shiftId: null,
                    shiftTemplateId: shift.id,
                    requiredSpecialityId: null, // Cualquier enfermera del departamento puede cubrirlo
                    assignedNurseId: null,
                    shiftInfo: currentShiftInfo,
                    generatedShiftId: ""
                });
            }
        }
    }

    console.log(`[Engine] Board successfully generated: ${slots.length} slots to cover.`);
    return slots;
}