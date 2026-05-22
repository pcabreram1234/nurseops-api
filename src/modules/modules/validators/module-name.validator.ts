import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ModuleNameValidator {
    validate(name: string): void {
        if (name.trim().length < 3) {
            throw new BadRequestException('The module name must be at least 3 characters long.');
        }
    }
}