import { SetMetadata } from '@nestjs/common';
import { FeaturTypes } from '@prisma/client';
import { METADATA_KEYS } from '../constants/feature-flags.constants';

/**
 * Decorador para restringir controladores o endpoints específicos según el estado de una FeatureFlag.
 */
export const RequireFeature = (feature: FeaturTypes) => SetMetadata(METADATA_KEYS.FEATURE_FLAG, feature);