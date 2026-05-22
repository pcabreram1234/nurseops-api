import { Injectable } from '@nestjs/common';
import { PriorityTypes, OperationalAlertyTypes } from '@prisma/client';

@Injectable()
export class AlertPriorityService {
    determinePriority(type: OperationalAlertyTypes, metadata?: any): PriorityTypes {
        if (type === 'EMERGENCY_COVERAGE_FAILED' || type === 'BURNOUT_CRITICAL') return 'CRITICAL';
        if (type === 'STAFFING_SHORTAGE' && metadata?.gapCount > 3) return 'HIGH';
        return 'MEDIUM';
    }
}