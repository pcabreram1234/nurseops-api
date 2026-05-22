import { Injectable, BadRequestException } from '@nestjs/common';
import { FeatureRolloutType } from '../enums/feature-rollout-type.enum';

@Injectable()
export class FeatureRolloutValidator {
    validateConfig(type: FeatureRolloutType, percentage?: number): void {
        if (type === FeatureRolloutType.PERCENTAGE && (percentage === undefined || percentage < 0 || percentage > 100)) {
            throw new BadRequestException('For percentage deployments, the value should range between 0 and 100.');
        }
    }
}