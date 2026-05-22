import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class OptimizationRulesValidator {
    validateHospitalConstraints(staffCount: number, operationalBeds: number): void {
        if (staffCount === 0 && operationalBeds > 0) {
            throw new BadRequestException('Impossible to optimize: The department has assigned operational beds but zero available nurses.');
        }
    }
}