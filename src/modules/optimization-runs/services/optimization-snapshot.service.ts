import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class OptimizationSnapshotService {
    private readonly logger = new Logger(OptimizationSnapshotService.name);

    createPreOptimizationSnapshot(scheduleId: string): string {
        this.logger.log(`[SNAPSHOT]: Freezing transactional quadrant state before calculation: ${scheduleId}`);
        return `snap_pre_${scheduleId}_${Date.now()}`;
    }
}