import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FatigueThresholdValidator {
    checkCriticalLevel(score: number): boolean {
        if (score < 0 || score > 100) {
            throw new BadRequestException('The numerical fatigue index for personnel should be between 0 and 100.');
        }
        return score >= 85;
    }
}