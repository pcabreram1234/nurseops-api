import { Injectable, BadRequestException } from '@nestjs/common';
import { PriorityTypes, OperationalAlertyTypes } from '@prisma/client';

@Injectable()
export class AlertSeverityValidator {
    validateCoherence(type: OperationalAlertyTypes, severity: PriorityTypes): void {
        // Forzar que fallos de cobertura crítica o escasez sean siempre graves
        if (type === 'EMERGENCY_COVERAGE_FAILED' && severity !== 'CRITICAL' && severity !== 'HIGH') {
            throw new BadRequestException('Un fallo de cobertura de emergencia no puede ostentar una severidad baja.');
        }
    }
}