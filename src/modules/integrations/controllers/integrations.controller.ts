import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { RolesGuard } from "@modules/auth/guards/roles.guards";

import { Roles } from "@modules/auth/decorators/roles.decorator";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { IntegrationsService } from "../services/integrations.service";

import { CreateIntegrationDto } from "../dto/create-integration.dto";
import { UpdateIntegrationDto } from "../dto/update-integration.dto";
import { IntegrationFilterDto } from "../dto/integration-filter.dto";

import { PERMISSIONS } from "@modules/permissions/constants/permissions.constants";

@Controller({
  path: "integrations",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles("SUPER",)
export class IntegrationsController {
  constructor(private readonly service: IntegrationsService) { }

  @Post()
  @Permissions(PERMISSIONS.INTEGRATIONS.CREATE)
  create(@Body() dto: CreateIntegrationDto) {
    return this.service.create(dto);
  }

  @Get()
  @Permissions(PERMISSIONS.INTEGRATIONS.READ)
  findAll(@Query() query: IntegrationFilterDto, @CurrentUser() user: any) {
    return this.service.findAll(query, user.organizationId);
  }

  @Get(":id")
  @Permissions(PERMISSIONS.INTEGRATIONS.READ)
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  @Patch(":id")
  @Permissions(PERMISSIONS.INTEGRATIONS.UPDATE)
  update(@Param("id") id: string, @Body() dto: UpdateIntegrationDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  @Permissions(PERMISSIONS.INTEGRATIONS.DELETE)
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
