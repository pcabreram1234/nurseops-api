import { ActivitySeverity } from '../enums/activity-severity.enum'

export interface ActivityFeedItem {
    id: string;
    userId: string;
    userName: string;
    action: string;
    severity: ActivitySeverity;
    summary: string;
    timestamp: Date;
}