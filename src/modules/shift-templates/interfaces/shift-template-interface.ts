// Tipos de entrada (Estos datos deberían venir de tu ScheduleContext de la Fase 1)
export interface ShiftTemplate {
    id: string;
    name: string; // Ej: "MORNING", "NIGHT"
    minimumStaff: number; // Ej: 3 personas requeridas por defecto
}