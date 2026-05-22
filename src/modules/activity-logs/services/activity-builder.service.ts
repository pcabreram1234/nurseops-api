import { Injectable } from '@nestjs/common';
import { ActivityPayloadStructure } from '../interfaces/activity-builder.interface';
import { ActivitySeverity } from '../enums/activity-severity.enum';
import { ActivitySource } from '../enums/activity-source.enum';

@Injectable()
export class ActivityBuilderService {
    buildSystemPayload(
        userId: string,
        action: string,
        details: Record<string, any>,
        severity: ActivitySeverity = ActivitySeverity.INFO,
    ): ActivityPayloadStructure {
        return {
            userId,
            action,
            severity,
            source: ActivitySource.SYSTEM_CRON,
            rawDetails: details,
            metadata: { builtAt: new Date().toISOString() },
        };
    }
}