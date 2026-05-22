import { OptimizationStrategy } from '../enums/optimization-strategy.enum';
export interface OptimizationContext {
    scheduleId: string;
    strategy: OptimizationStrategy;
    maxIterations: number;
    allowOvertime: boolean;
}