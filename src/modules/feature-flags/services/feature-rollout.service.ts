import { Injectable, Logger } from '@nestjs/common';
import { FeatureRolloutType } from '../enums/feature-rollout-type.enum';
import { FeatureRolloutValidator } from '../validators/feature-rollout.validator';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FEATURE_EVENTS } from '../constants/feature-flags.constants';
import { FeatureRolloutStartedEvent } from '../events/feature-rollout-started.event';

@Injectable()
export class FeatureRolloutService {
    private readonly logger = new Logger(FeatureRolloutService.name);

    constructor(
        private readonly validator: FeatureRolloutValidator,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async configureRollout(featureName: string, type: FeatureRolloutType, targetPercentage?: number) {
        this.validator.validateConfig(type, targetPercentage);

        this.logger.log(`[ROLLOUT]: Configuring progressive rollout for ${featureName}. Type: ${type}`);

        this.eventEmitter.emit(
            FEATURE_EVENTS.ROLLOUT_STARTED,
            new FeatureRolloutStartedEvent(featureName, type, { percentage: targetPercentage }),
        );

        return { success: true, featureName, strategy: type, percentage: targetPercentage };
    }
}