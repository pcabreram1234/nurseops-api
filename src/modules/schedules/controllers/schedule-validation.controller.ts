import { Controller, Get, Query, Post, HttpCode, Body, HttpStatus } from "@nestjs/common";
import { ScheduleValidationService } from "../services/schedule-validation.service";
import { ValidateAssignmentDto } from "../dto/validate-assignment.dto";
import { SingleValidationResult } from "../interfaces/single-validation-result.interface";

@Controller({
    path: 'schedule-validation',
    version: '1'
})
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

    @Post('single-assignment')
    @HttpCode(HttpStatus.OK)
    async validateAssignment(
        @Body() dto: ValidateAssignmentDto,
    ): Promise<SingleValidationResult> {
        return await this.validationService.validateSingleAssignment(dto);
    }
}