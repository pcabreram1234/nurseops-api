import { ActivitySeverity } from '../enums/activity-severity.enum';
import { ActivitySource } from '../enums/activity-source.enum';

export interface ActivityPayloadStructure {
    userId: string;
    action: string;
    severity: ActivitySeverity;
    source: ActivitySource;
    rawDetails: Record<string, any>;
    metadata?: Record<string, any>;
}