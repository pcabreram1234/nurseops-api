import { AlertSourceEngine } from '../enums/alert-source.enum'
export interface AlertContext {
    engineSource: AlertSourceEngine;
    triggeredAt: Date;
    activeStaffCount?: number;
    requiredStaffCount?: number;
}