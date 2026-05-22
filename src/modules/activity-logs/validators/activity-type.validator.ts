import { Injectable, BadRequestException } from '@nestjs/common';
import { ActivityLogType } from '@prisma/client';

@Injectable()
export class ActivityTypeValidator {
    validate(action: string): void {
        const validActions = Object.values(ActivityLogType);
        if (!validActions.includes(action as any)) {
            throw new BadRequestException(`The type of action '${action}' is not a valid system operator.`);
        }
    }
}