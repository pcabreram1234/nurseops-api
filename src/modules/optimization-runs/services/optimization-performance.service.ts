import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class OptimizationPerformanceService {
    private readonly logger = new Logger(OptimizationPerformanceService.name);

    logPerformanceTelemetry(runId: string, durationMs: number, iterations: number): void {
        this.logger.log(
            `[MÉTRICAS DEL MOTOR]: Runs ${runId} complete. Iterations: ${iterations}. Net time: ${durationMs}ms. Speed: ${(iterations / (durationMs / 1000)).toFixed(2)} ops/seg.`,
        );
    }
}