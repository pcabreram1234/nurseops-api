export interface AlertPayload {
    scheduleId: string;
    type: 'STAFF_SHORTAGE' | 'NO_NIGHT_COVERAGE' | 'MISSING_SPECIALIST';
    message: string;
    date: Date;
    departmentId: string;
}