import { Injectable, BadRequestException } from '@nestjs/common';
import { FeaturTypes } from '@prisma/client';

@Injectable()
export class FeatureNameValidator {
    validate(name: string): void {
        const validFeatures = Object.values(FeaturTypes);
        if (!validFeatures.includes(name as any)) {
            throw new BadRequestException(`The feature name '${name}' does not exist in the system schema.`);
        }
    }
}