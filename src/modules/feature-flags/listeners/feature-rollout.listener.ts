import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FEATURE_EVENTS } from '../constants/feature-flags.constants';
import { FeatureRolloutStartedEvent } from '../events/feature-rollout-started.event';

@Injectable()
export class FeatureRolloutListener {
    private readonly logger = new Logger(FeatureRolloutListener.name);

    @OnEvent(FEATURE_EVENTS.ROLLOUT_STARTED)
    handleRolloutStarted(event: FeatureRolloutStartedEvent) {
        this.logger.log(`[METRIC]: Gradual rollout initiated for ${event.featureName}.`);
    }
}