import { Injectable, Logger } from '@nestjs/common';
import { OptimizationStrategy } from '../enums/optimization-strategy.enum';

@Injectable()
export class OptimizationAiService {
    private readonly logger = new Logger(OptimizationAiService.name);

    async generateHeuristicWeights(strategy: OptimizationStrategy): Promise<Record<string, number>> {
        this.logger.log(`[AI SOLVER]: Processing predictive heuristics for optimization type: ${strategy}`);

        if (strategy === OptimizationStrategy.HYBRID_AI) {
            return { fatigueWeight: 0.5, fairnessWeight: 0.3, costWeight: 0.2 };
        }
        return { fatigueWeight: 0.3, fairnessWeight: 0.3, costWeight: 0.4 };
    }
}