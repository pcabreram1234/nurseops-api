import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WORKLOAD_SYSTEM_LISTENERS } from '../constants/workload-metrics.constants';
import { WorkloadAggregationService } from '../services/workload-aggregation.service';

@Injectable()
export class ShiftCompletedListener {
    private readonly logger = new Logger(ShiftCompletedListener.name);

    constructor(private readonly aggregationService: WorkloadAggregationService) { }

    @OnEvent(WORKLOAD_SYSTEM_LISTENERS.SHIFT_COMPLETED)
    async handleShiftCompleted(payload: { nurseId: string; organizationId: string; hoursWorked: number }) {
        this.logger.log(`[INTERNAL EVENT]: Shift completed by nurse ${payload.nurseId}. Forcing dynamic recalculation...`);

        const now = new Date();
        await this.aggregationService.aggregateNurseMonthlyMetrics(
            payload.nurseId,
            payload.organizationId,
            now.getMonth() + 1,
            now.getFullYear(),
        );
    }
}