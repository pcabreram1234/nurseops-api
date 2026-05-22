import { Injectable, BadRequestException } from '@nestjs/common';
import { WORKLOAD_THRESHOLDS } from '../constants/workload-metrics.constants';

@Injectable()
export class OvertimeLimitValidator {
    validate(overtimeHours: number): void {
        if (overtimeHours > WORKLOAD_THRESHOLDS.MAX_OVERTIME_HOURS_MONTHLY * 1.5) {
            throw new BadRequestException(
                `Critical: Overtime (${overtimeHours}h) They drastically exceed the hospital's legal limit. Urgent mitigation is required..`,
            );
        }
    }
}