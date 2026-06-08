import { ShiftInfo } from "@modules/shifts/interfaces/shift-info-interfaces";
// Tipo de salida: La ranura vacía que el motor deberá llenar
export interface ScheduleSlot {
    id: string;             // ID único en memoria para esta ranura
    date: Date;             // Día del mes
    shiftId: string | null;        // A qué turno pertenece
    shiftTemplateId: string;
    requiredSpecialityId: string | null; // Si es null, cualquier enfermera sirve
    assignedNurseId: string | null;      // Arranca en null (vacío)
    metrics?: string | [] | null;
    shiftInfo: ShiftInfo;
    generatedShiftId: string;
}

// Tipo de salida para la asignación manual de personal
export interface IndividualScheduleSlot {
    id: string;             // ID único en memoria para esta ranura
    date: Date;             // Día del mes
    shiftId: string | null;        // A qué turno pertenece
    shiftTemplateId: string;
    requiredSpecialityId: string | null; // Si es null, cualquier enfermera sirve
    assignedNurseId: string | null;      // Arranca en null (vacío)
    metrics?: string | [] | null;
    shiftInfo: IndividualShiftInfo;
    generatedShiftId: string;
}


export interface IndividualShiftInfo {
    id: string;
    name:string;
    duration:number;
    type: string;            // Ej: 'Noche', 'Mañana'
    isNightShift: boolean;   // true / false
    startTime: Date;         // (o string, dependiendo de cómo lo devuelva Prisma)
    endTime: Date;           // (o string)
}