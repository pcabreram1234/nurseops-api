import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ActivityDetailsValidator {
    validateStructure(details: any): void {
        if (!details || typeof details !== 'object' || Array.isArray(details)) {
            throw new BadRequestException('The details field must be a valid structured JSON object.');
        }
    }
}