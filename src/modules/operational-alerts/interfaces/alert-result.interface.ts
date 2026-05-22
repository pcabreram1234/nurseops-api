import { OperationalAlertStatus } from '@prisma/client';
export interface AlertResultStructure {
    alertId: string;
    isActionable: boolean;
    requiresImmediateEscalation: boolean;
    currentStatus: OperationalAlertStatus;
}