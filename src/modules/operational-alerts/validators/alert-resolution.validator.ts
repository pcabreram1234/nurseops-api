import { Injectable, BadRequestException } from '@nestjs/common';
import { OperationalAlertStatus } from '@prisma/client';

@Injectable()
export class AlertResolutionValidator {
    validateCurrentState(status: OperationalAlertStatus): void {
        if (status === 'RESOLVED') {
            throw new BadRequestException('The operational alert has already been resolved and archived..');
        }
    }
}