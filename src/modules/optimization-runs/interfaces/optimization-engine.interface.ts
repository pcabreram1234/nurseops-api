import { OptimizationContext } from './optimization-context.interface';
import { OptimizationResultStructure } from './optimization-result.interface';
export interface IOptimizationEngine {
    process(context: OptimizationContext): Promise<OptimizationResultStructure>;
}