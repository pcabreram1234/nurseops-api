export interface ShiftInfo {
    type: string;            // Ej: 'Noche', 'Mañana'
    name?: string;           // Nombre en idioma del usuario (mañana, tarde, noche) - puede ser null
    durationHours: number;   // Ej: 8, 12
    isNightShift: boolean;   // true / false
    startTime: Date;         // (o string, dependiendo de cómo lo devuelva Prisma)
    endTime: Date;           // (o string)
}