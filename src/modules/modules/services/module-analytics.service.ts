import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ModuleAnalyticsService {
    private readonly logger = new Logger(ModuleAnalyticsService.name);

    async trackExecution(moduleCode: string, executionTimeMs: number): Promise<void> {
        this.logger.debug(`[MÉTRICA]: Module '${moduleCode}' responded in ${executionTimeMs}ms.`);
        // Aquí puedes guardar métricas agregadas en BD para analíticas de rendimiento del hospital
    }
}