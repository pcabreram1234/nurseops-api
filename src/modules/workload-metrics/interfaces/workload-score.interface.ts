import { WorkloadSeverity } from '../enums/workload-severity.enum';
export interface WorkloadScoreStructure {
    rawCalculatedScore: number;
    severity: WorkloadSeverity;
    isOverloaded: boolean;
}