import { FeatureRolloutType } from '../enums/feature-rollout-type.enum';
export interface FeatureRolloutConfiguration {
    rolloutType: FeatureRolloutType;
    percentageThreshold?: number;
    targetDepartments?: string[];
}