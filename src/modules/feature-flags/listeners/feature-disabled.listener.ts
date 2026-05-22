import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FEATURE_EVENTS } from '../constants/feature-flags.constants';
import { FeatureDisabledEvent } from '../events/feature-disabled.event';

@Injectable()
export class FeatureDisabledListener {
    private readonly logger = new Logger(FeatureDisabledListener.name);

    @OnEvent(FEATURE_EVENTS.DISABLED)
    handleFeatureDisabled(event: FeatureDisabledEvent) {
        this.logger.warn(`[CRITICAL CONFIGURATION NOTICE]: Functionality [${event.featureName}] disabled in emergency.`);
    }
}