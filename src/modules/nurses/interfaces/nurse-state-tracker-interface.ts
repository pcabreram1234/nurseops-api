// Rastreador dinámico para el estado mensual en tiempo real
export interface NurseStateTracker {
    assignedHours: number;
    assignedNights: number;
    consecutiveDaysWorked: number;
    lastShiftEndTime: Date | null;
    lastWorkedDate: Date | null;

}