import { ActivitySource } from '../enums/activity-source.enum';

export interface ActivityContext {
    ipAddress?: string;
    userAgent?: string;
    source: ActivitySource;
    organizationId: string;
}