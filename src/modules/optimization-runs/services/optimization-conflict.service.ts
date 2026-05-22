import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OPTIMIZATION_EVENTS } from '../constants/optimization-runs.constants';
import { OptimizationConflictEvent } from '../events/optimization-conflict.event';

@Injectable()
export class OptimizationConflictService {
    private readonly logger = new Logger(OptimizationConflictService.name);

    constructor(private readonly eventEmitter: EventEmitter2) { }

    async scanAndResolveHardConflicts(scheduleId: string, constraints: any[]): Promise<number> {
        this.logger.log(`Analyzing regulatory overlaps for the schedule: ${scheduleId}`);
        let resolvedCount = 0;

        // Lógica simulada de resolución de colisiones (ej. doble turno nocturno seguido)
        if (constraints.length > 0) {
            resolvedCount = 2;
            this.eventEmitter.emit(
                OPTIMIZATION_EVENTS.CONFLICT_DETECTED,
                new OptimizationConflictEvent(scheduleId, 'nurse-uuid-sample', 'Detected violation of minimum 12-hour rest.'),
            );
        }

        return resolvedCount;
    }
}