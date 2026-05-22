import { ModuleStatus } from "../enums/module-status.enum";

export interface ModuleHealthReport {
    moduleCode: string;
    status: ModuleStatus;
    latencyMs: number;
    lastChecked: Date;
    issues: string[];
}