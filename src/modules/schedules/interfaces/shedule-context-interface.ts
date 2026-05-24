// Definimos la interfaz del contexto para tener tipado estricto en el motor
export interface ScheduleContext {
    settings: {
        organization: any; // Tipar según Prisma (ej. OrganizationSettings)
        department?: any;   // Tipar según Prisma
    };
    nurses: any[];
    blocks: {
        vacations: any[];
        leaves: any[];
        availabilities: any[];
    };
    previousMetrics: any[];
}

