import { Controller, Get, Query } from "@nestjs/common";
import { ScheduleValidationService } from "../services/schedule-validation.service";

@Controller('schedule-validation')
export class ValidationController {
    constructor(private validationService: ScheduleValidationService) { }

    @Get('check')
    async checkAssignment(
        @Query('nurseId') nurseId: string,
        @Query('date') date: string,
        @Query('shiftId') shiftId: string
    ) {
        return await this.validationService.validateAssignment(nurseId, new Date(date), shiftId);
    }
}