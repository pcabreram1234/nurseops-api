import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class AlertRoutingValidator {
    validateSupervisorAvailability(hasSupervisorAssigned: boolean): void {
        if (!hasSupervisorAssigned) {
            throw new BadRequestException('Unable to route alert: The destination clinical department does not have an active supervisor assigned.');
        }
    }
}