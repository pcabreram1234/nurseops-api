import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { OptimizationRunsService, UserOrgContext } from '../services/optimization-runs.service';
import { ExecuteOptimizationDto } from '../dto/execute-optimization.dto';
import { OptimizationFilterDto } from '../dto/optimization-filter.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guards';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { PermissionsGuard } from '@modules/auth/guards/permissions.guard';
import { Permissions } from '@modules/auth/decorators/permissions.decorator';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';

@Controller({ path: 'optimization-runs', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class OptimizationRunsController {
    constructor(private readonly runsService: OptimizationRunsService) { }

    @Post('execute')
    @Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER", "NIGTH_SUPERVISOR", "SUPVERVISOR")
    @Permissions("EXECUTE_SCHEDULE_OPTIMIZATION")
    executeSolver(@Body() dto: ExecuteOptimizationDto, @CurrentUser() user: any) {
        const userOrg: UserOrgContext = {
            organizationId: user?.organizationId,
            role: user?.role,
        };
        return this.runsService.executeAndRecordRun(dto, userOrg);
    }

    @Get()
    @Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER", "NIGTH_SUPERVISOR", "SUPVERVISOR")
    @Permissions("VIEW_OPTIMIZATION_METRICS")
    findAll(@Query() query: OptimizationFilterDto, @CurrentUser() user: any) {
        const userOrg: UserOrgContext = {
            organizationId: user?.organizationId,
            role: user?.role,
        };
        return this.runsService.findAll(query, userOrg);
    }

    @Get(":id")
    @Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER", "NIGTH_SUPERVISOR", "SUPVERVISOR")
    @Permissions("VIEW_OPTIMIZATION_METRICS")
    findOne(@Param("id") id: string, @CurrentUser() user: any) {
        const userOrg: UserOrgContext = {
            organizationId: user?.organizationId,
            role: user?.role,
        };
        return this.runsService.findOne(id, userOrg);
    }
}