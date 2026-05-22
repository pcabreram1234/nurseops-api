import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FairnessThresholdValidator {
    validateScoreRange(score: number): void {
        if (score < 0 || score > 100) {
            throw new BadRequestException('The index of equitable distribution of hospital shifts should be from 0 to 100.');
        }
    }
}