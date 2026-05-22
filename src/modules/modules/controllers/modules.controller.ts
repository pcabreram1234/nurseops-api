import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ModulesService } from '../services/modules.service';
import { ModuleHealthService } from '../services/module-health.service';
import { CreateModuleDto } from '../dto/create-module.dto';
import { UpdateModuleDto } from '../dto/update-module.dto';
import { ModuleFilterDto } from '../dto/module-filter.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@modules/auth/guards/permissions.guard';
import { Permissions } from '@modules/auth/decorators/permissions.decorator';

@Controller({ path: 'modules', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ModulesController {
    constructor(
        private readonly modulesService: ModulesService,
        private readonly healthService: ModuleHealthService,
    ) { }

    @Post()
    @Permissions('MANAGE_SYSTEM_MODULES')
    create(@Body() dto: CreateModuleDto) {
        return this.modulesService.create(dto);
    }

    @Get()
    @Permissions('VIEW_SYSTEM_MODULES')
    findAll(@Query() query: ModuleFilterDto) {
        return this.modulesService.findAll(query);
    }

    @Patch(':id')
    @Permissions('MANAGE_SYSTEM_MODULES')
    update(@Param('id') id: string, @Body() dto: UpdateModuleDto) {
        return this.modulesService.update(id, dto);
    }

    @Get(':code/health')
    @Permissions('VIEW_SYSTEM_MODULES')
    getHealth(@Param('code') code: string) {
        return this.healthService.checkHealth(code);
    }
}