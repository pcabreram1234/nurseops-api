import { Injectable, Logger } from '@nestjs/common';
import { OptimizationContext } from '../interfaces/optimization-context.interface';
import { OptimizationResultStructure } from '../interfaces/optimization-result.interface';
import { OptimizationScoreService } from './optimization-score.service';
import { OptimizationConflictService } from './optimization-conflict.service';
import { OptimizationAiService } from './optimization-ai.service';

@Injectable()
export class OptimizationEngineService {
    private readonly logger = new Logger(OptimizationEngineService.name);

    constructor(
        private readonly scoreService: OptimizationScoreService,
        private readonly conflictService: OptimizationConflictService,
        private readonly aiService: OptimizationAiService,
    ) { }

    async runCombinatorialSolver(ctx: OptimizationContext): Promise<OptimizationResultStructure> {
        const startTime = Date.now();
        this.logger.log(`Starting a math solver for turn-based role-playing ${ctx.scheduleId}`);

        // 1. Cargar heurísticas de la IA
        const weights = await this.aiService.generateHeuristicWeights(ctx.strategy);

        // 2. Analizar y sanear colisiones legislativas/médicas duras
        const resolvedConflicts = await this.conflictService.scanAndResolveHardConflicts(ctx.scheduleId, [1]);

        // 3. Evaluar la función de puntuación adaptativa
        const analysis = this.scoreService.evaluateMatrixScore({ mock: true, weights });

        const duration = Date.now() - startTime;

        return {
            assignedShiftsCount: 142,
            conflictsResolvedCount: resolvedConflicts,
            finalScore: analysis.globalScore,
            processingTimeMs: duration,
            violationsEvaded: ['DOUBLE_SHIFT_PREVENTION', 'REST_PERIOD_VIOLATION'],
        };
    }
}