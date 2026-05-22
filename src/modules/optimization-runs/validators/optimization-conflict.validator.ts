import { Injectable, ConflictException } from '@nestjs/common';

@Injectable()
export class OptimizationConflictValidator {
    checkOverlapAnomaly(hasOverlappingShifts: boolean): void {
        if (hasOverlappingShifts) {
            throw new ConflictException('Critical inconsistency detected: Shift overlaps were found in the base constraints.');
        }
    }
}