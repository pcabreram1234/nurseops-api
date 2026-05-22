import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class OptimizationTimeValidator {
    validateRunWindow(started: Date, finished: Date): void {
        if (finished.getTime() < started.getTime()) {
            throw new BadRequestException('The completion timestamp cannot be chronologically earlier than the start of processing.');
        }
    }
}