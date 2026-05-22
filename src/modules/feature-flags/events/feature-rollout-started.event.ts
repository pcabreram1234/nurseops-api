import { FeatureRolloutType } from '../enums/feature-rollout-type.enum';

export class FeatureRolloutStartedEvent {
    constructor(
        public readonly featureName: string,
        public readonly rolloutType: FeatureRolloutType,
        public readonly targetDetails: any,
    ) { }
}