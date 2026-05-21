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

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { DepartmentConfigurationsService } from "../services/department-configurations.service";

import { CreateDepartmentConfigurationDto } from "../dto/create-department-configuration.dto";
import { UpdateDepartmentConfigurationDto } from "../dto/update-department-configuration.dto";


@Controller({
  path: "department-configurations",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "SUPERVISOR")
export class DepartmentConfigurationsController {
  constructor(private readonly service: DepartmentConfigurationsService) {}

  @Post()
  create(@Body() dto: CreateDepartmentConfigurationDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.service.findAll(user.organizationId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateDepartmentConfigurationDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
