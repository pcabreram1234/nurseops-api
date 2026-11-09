import { Controller, Get, Query, Post, HttpCode, Body, HttpStatus, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";
import { Roles } from "@modules/auth/decorators/roles.decorator";
import { ScheduleValidationService, UserOrgContext } from "../services/schedule-validation.service";
import { ValidateAssignmentDto } from "../dto/validate-assignment.dto";
import { SingleValidationResult } from "../interfaces/single-validation-result.interface";
import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

@Controller({
    path: 'schedule-validation',
    version: '1'
})
@Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER", "DEPARTMENT_HEAD", "NIGHT_SUPERVISOR", "SUPERVISOR")
@UseGuards(JwtAuthGuard, PermissionsGuard)

export class ValidationController {
    constructor(private validationService: ScheduleValidationService) { }

    @Get('check')
    async checkAssignment(
        @Query('nurseId') nurseId: string,
        @Query('date') date: string,
        @Query('shiftId') shiftId: string,
        @CurrentUser() user: any
    ) {
        const userOrg: UserOrgContext = {
            organizationId: user?.organizationId,
            departmentId: user?.departmentId,
            role: user?.role,
            id: user?.id || user?.sub,
        };
        return await this.validationService.validateAssignment(nurseId, new Date(date), shiftId, userOrg);
    }

    @Post('single-assignment')
    @HttpCode(HttpStatus.OK)
    async validateAssignment(
        @Body() dto: ValidateAssignmentDto,
        @CurrentUser() user: any
    ): Promise<SingleValidationResult> {
        const userOrg: UserOrgContext = {
            organizationId: user?.organizationId,
            departmentId: user?.departmentId,
            role: user?.role,
            id: user?.id || user?.sub,
        };
        return await this.validationService.validateSingleAssignment(dto, userOrg);
    }
}
