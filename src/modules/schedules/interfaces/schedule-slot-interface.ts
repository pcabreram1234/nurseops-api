// Tipo de salida: La ranura vacía que el motor deberá llenar
export interface ScheduleSlot {
    id: string;             // ID único en memoria para esta ranura
    date: Date;             // Día del mes
    shiftId: string;        // A qué turno pertenece
    shiftTemplateId: string;
    requiredSpecialityId: string | null; // Si es null, cualquier enfermera sirve
    assignedNurseId: string | null;      // Arranca en null (vacío)
    metrics?: string | [] | null
}