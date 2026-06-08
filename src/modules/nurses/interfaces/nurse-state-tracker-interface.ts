import { IndividualScheduleSlot } from "@modules/schedules/interfaces/schedule-slot-interface";
// Rastreador dinámico para el estado mensual en tiempo real
export interface NurseStateTracker {
    assignedHours: number;
    assignedNights: number;
    consecutiveDaysWorked: number;
    consecutiveNightsWorked: number;
    weekendsWorked: number;
    lastShiftEndTime: Date | null;
    lastWorkedDate: Date | null;
    wasLastShiftNight: boolean
}

// Rastreador dinámico para el estado mensual en tiempo real de una enfermera
export interface IndividualNurseStateTracker {
    nurseId: string;
    assignedHours: number;
    consecutiveDaysWorked: number;
    consecutiveNightsWorked: number;
    lastShiftEndTime: Date | null
    wasLastShiftNight: boolean;
    preferredShiftsCovered: number;
    weekendShiftsCovered: number;
    fairnessScore: number;
    fatigueScore: number;
    // slots: IndividualScheduleSlot;
}