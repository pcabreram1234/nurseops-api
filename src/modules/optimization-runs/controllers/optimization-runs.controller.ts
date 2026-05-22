import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { OptimizationRunsService } from '../services/optimization-runs.service';
import { ExecuteOptimizationDto } from '../dto/execute-optimization.dto';
import { OptimizationFilterDto } from '../dto/optimization-filter.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@modules/auth/guards/permissions.guard';
import { Permissions } from '@modules/auth/decorators/permissions.decorator';

@Controller({ path: 'optimization-runs', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OptimizationRunsController {
    constructor(private readonly runsService: OptimizationRunsService) { }

    @Post('execute')
    @Permissions('EXECUTE_SCHEDULE_OPTIMIZATION')
    executeSolver(@Body() dto: ExecuteOptimizationDto) {
        return this.runsService.executeAndRecordRun(dto);
    }

    @Get()
    @Permissions('VIEW_OPTIMIZATION_METRICS')
    findAll(@Query() query: OptimizationFilterDto) {
        return this.runsService.findAll(query);
    }

    @Get(':id')
    @Permissions('VIEW_OPTIMIZATION_METRICS')
    findOne(@Param('id') id: string) {
        return this.runsService.findOne(id);
    }
}