import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ModuleStateValidator {
    validateSystemMutation(isSystem: boolean, changingActiveState: boolean): void {
        if (isSystem && changingActiveState) {
            throw new BadRequestException('Directly disabling or altering critical system modules is not permitted.');
        }
    }
}