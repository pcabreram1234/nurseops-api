import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { FeatureFlagsService } from '../services/feature-flags.service';
import { FeatureAnalyticsService } from '../services/feature-analytics.service';
import { CreateFeatureFlagDto } from '../dto/create-feature-flag.dto';
import { FeatureFlagFilterDto } from '../dto/feature-flag-filter.dto';
import { ToggleFeatureFlagDto } from '../dto/toggle-feature-flag.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@modules/auth/guards/permissions.guard';
import { Permissions } from '@modules/auth/decorators/permissions.decorator';

@Controller({ path: 'feature-flags', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FeatureFlagsController {
    constructor(
        private readonly flagsService: FeatureFlagsService,
        private readonly analyticsService: FeatureAnalyticsService,
    ) { }

    @Post()
    @Permissions('MANAGE_FEATURE_FLAGS')
    create(@Body() dto: CreateFeatureFlagDto) {
        return this.flagsService.create(dto);
    }

    @Get()
    @Permissions('VIEW_FEATURE_FLAGS')
    findAll(@Query() filters: FeatureFlagFilterDto) {
        return this.flagsService.findAll(filters);
    }

    @Get('analytics')
    @Permissions('VIEW_FEATURE_FLAGS')
    getAnalytics() {
        return this.analyticsService.getSummaryMetrics();
    }

    @Patch(':id/toggle')
    @Permissions('MANAGE_FEATURE_FLAGS')
    toggle(@Param('id') id: string, @Body() dto: ToggleFeatureFlagDto, @Request() req: any) {
        const operatorId = req.user?.id;
        return this.flagsService.toggle(id, dto, operatorId);
    }
}