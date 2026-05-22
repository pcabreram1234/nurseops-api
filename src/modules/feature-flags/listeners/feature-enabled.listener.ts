import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FEATURE_EVENTS } from '../constants/feature-flags.constants';
import { FeatureEnabledEvent } from '../events/feature-enabled.event';

@Injectable()
export class FeatureEnabledListener {
    private readonly logger = new Logger(FeatureEnabledListener.name);

    @OnEvent(FEATURE_EVENTS.ENABLED)
    handleFeatureEnabled(event: FeatureEnabledEvent) {
        this.logger.log(`[ENVIRONMENT NOTIFICATION]: Functional module [${event.featureName}] enabled globally.`);
        // Aquí puedes purgar otras cachés de negocio secundarias si es necesario
    }
}