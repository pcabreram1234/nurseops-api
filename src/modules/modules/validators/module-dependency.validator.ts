import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ModuleDependencyValidator {
    async verifyCrossDependencies(moduleCode: string, dependencies: string[]): Promise<void> {
        if (dependencies.includes(moduleCode)) {
            throw new BadRequestException('A module cannot cyclically depend on itself.');
        }
    }
}