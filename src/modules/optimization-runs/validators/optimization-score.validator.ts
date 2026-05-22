import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ENGINE_CONFIG } from '../constants/optimization-runs.constants';

@Injectable()
export class OptimizationScoreValidator {
    validateResultScore(score: number): void {
        if (score < ENGINE_CONFIG.MIN_ACCEPTABLE_SCORE) {
            throw new UnprocessableEntityException(
                `The algorithmic result yielded an efficiency of ${score}%, below the hospital's minimum threshold (${ENGINE_CONFIG.MIN_ACCEPTABLE_SCORE}%).`,
            );
        }
    }
}