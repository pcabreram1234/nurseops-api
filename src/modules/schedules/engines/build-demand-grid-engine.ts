import { ShiftTemplate, DepartmentSpeciality } from "@prisma/client";
import { ScheduleSlot } from "../interfaces/schedule-slot-interface";
import { startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { randomUUID } from "node:crypto";

export function buildDemandGrid(
    targetDate: Date,
    shiftTemplates: ShiftTemplate[],
    specialityRequirements: DepartmentSpeciality[]
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

            // 4. Inyectar primero los requerimientos de especialidad OBLIGATORIOS
            for (const req of specialityRequirements) {
                // Si el departamento exige 1 especialista de UCI en este turno, creamos esa ranura específica
                for (let i = 0; i < req.minimum_staff; i++) {
                    slots.push({
                        id: randomUUID(),
                        date: date,
                        shiftId: shift.id,
                        requiredSpecialityId: req.specialityId,
                        assignedNurseId: null, // Listo para ser llenado por el algoritmo
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
                    shiftId: shift.id,
                    requiredSpecialityId: null, // Cualquier enfermera del departamento puede cubrirlo
                    assignedNurseId: null,
                });
            }
        }
    }

    console.log(`[Engine] Board successfully generated: ${slots.length} slots to cover.`);
    return slots;
}