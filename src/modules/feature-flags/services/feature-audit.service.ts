import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FeatureAuditService {
    private readonly logger = new Logger(FeatureAuditService.name);

    logStateChange(featureName: string, newState: boolean, actorId?: string): void {
        this.logger.log(
            `[CONFIGURATION AUDIT]: The flag [${featureName}] was changed to [${newState ? 'ON' : 'OFF'}] by the operator [${actorId || 'CRON_SYSTEM'}].`,
        );
    }
}