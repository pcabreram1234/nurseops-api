import { Injectable } from '@nestjs/common';

@Injectable()
export class BurnoutThresholdValidator {
    isCriticalRisk(burnoutScore: number): boolean {
        return burnoutScore >= 90;
    }
}