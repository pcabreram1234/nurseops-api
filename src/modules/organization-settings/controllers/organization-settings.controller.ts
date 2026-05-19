import { Controller, Get, Post, Patch, Body, UseGuards } from "@nestjs/common";

import { OrganizationSettingsService } from "../services/organization-settings.service";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { CreateOrganizationSettingDto } from "../dto/create-organization-setting.dto";
import { UpdateOrganizationSettingDto } from "../dto/update-organization-setting.dto";

@Controller({
  path: "organization-settings",
  version: "1",
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OrganizationSettingsController {
  constructor(
    private readonly organizationSettingsService: OrganizationSettingsService,
  ) {}

  @Post()
  @Permissions("CREATE_ORGANIZATION_SETTINGS")
  create(@Body() dto: CreateOrganizationSettingDto) {
    return this.organizationSettingsService.create(dto);
  }

  @Get("me")
  @Permissions("VIEW_ORGANIZATION_SETTINGS")
  findMine(@CurrentUser() user: any) {
    return this.organizationSettingsService.findOne(user.organizationId);
  }

  @Patch("me")
  @Permissions("UPDATE_ORGANIZATION_SETTINGS")
  update(@Body() dto: UpdateOrganizationSettingDto, @CurrentUser() user: any) {
    return this.organizationSettingsService.update(user.organizationId, dto);
  }
}
