import { Injectable } from '@nestjs/common';
import { ActivityPayloadStructure } from '../interfaces/activity-builder.interface';

@Injectable()
export class ActivityEnrichmentService {
    enrich(payload: ActivityPayloadStructure): Record<string, any> {
        return {
            ...payload.rawDetails,
            _securityContext: {
                severity: payload.severity,
                source: payload.source,
                processedByCoreAt: new Date(),
                metadata: payload.metadata || {},
            },
        };
    }
}