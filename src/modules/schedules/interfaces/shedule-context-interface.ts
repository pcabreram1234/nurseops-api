import { ScheduleSlot } from "./schedule-slot-interface";
// Definimos la interfaz del contexto para tener tipado estricto en el motor
export interface ScheduleContext {
    settings: {
        organization: any; // Tipar según Prisma (ej. OrganizationSettings)
        department?: any;   // Tipar según Prisma
        configurableRules?: any[] | [] //Reglas configurables d ela organizacion
    };
    engineRules: {
        hard: any[],
        soft: any[] | [],
        event: any[] | []
    },
    nurses: any[];
    blocks: {
        vacations: any[];
        leaves: any[];
        availabilities: any[];
    };
    previousMetrics: any[];
    allSlots?: ScheduleSlot[];
    historicalSlots: any[];
}

