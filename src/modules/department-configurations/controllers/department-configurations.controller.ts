import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { RolesGuard } from "@modules/auth/guards/roles.guards";

import { Roles } from "@modules/auth/decorators/roles.decorator";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { DepartmentConfigurationsService } from "../services/department-configurations.service";

import { CreateDepartmentConfigurationDto } from "../dto/create-department-configuration.dto";
import { UpdateDepartmentConfigurationDto } from "../dto/update-department-configuration.dto";


import { PERMISSIONS } from "@modules/permissions/constants/permissions.constants";


@Controller({
  path: "department-configurations",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class DepartmentConfigurationsController {
  constructor(private readonly service: DepartmentConfigurationsService) { }

  @Post()
  @Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER")
  @Permissions(PERMISSIONS.DEPARTMENTS.CREATE)
  create(@Body() dto: CreateDepartmentConfigurationDto) {
    return this.service.create(dto);
  }

  @Get()
  @Permissions(PERMISSIONS.DEPARTMENTS.READ)
  findAll(@CurrentUser() user: any) {
    return this.service.findAll(user.organizationId);
  }

  @Get(":id")
  @Permissions(PERMISSIONS.DEPARTMENTS.READ)
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Patch(":id")
  @Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER")
  @Permissions(PERMISSIONS.DEPARTMENTS.UPDATE)
  update(@Param("id") id: string, @Body() dto: UpdateDepartmentConfigurationDto, @CurrentUser() user: any) {
    return this.service.update(id, dto, user);
  }

  @Delete(":id")
  @Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER")
  @Permissions(PERMISSIONS.DEPARTMENTS.DELETE)
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user);
  }
}
