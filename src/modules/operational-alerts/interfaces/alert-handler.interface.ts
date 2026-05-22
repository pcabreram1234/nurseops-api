export interface OperationalAlertHandler {
    processStrategy(alertId: string, payload: Record<string, any>): Promise<void>;
}