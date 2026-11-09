import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";

import { OrganizationSettingsService, UserOrgContext } from "../services/organization-settings.service";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { Roles } from "@modules/auth/decorators/roles.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { CreateOrganizationSettingDto } from "../dto/create-organization-setting.dto";
import { UpdateOrganizationSettingDto } from "../dto/update-organization-setting.dto";
import { PaginationDto } from "../dto/pagination.dto";

@Controller({
  path: "organization-settings",
  version: "1",
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Roles("SUPER", "SYSTEM_ADMIN","HR_MANAGER")

export class OrganizationSettingsController {
  constructor(
    private readonly organizationSettingsService: OrganizationSettingsService,
  ) { }

  @Post()
  @Permissions("CREATE_ORGANIZATION_SETTINGS")
  create(@Body() dto: CreateOrganizationSettingDto, @CurrentUser() user: any) {
    const userOrg: UserOrgContext = {
      organizationId: user?.organizationId,
      role: user?.role,
    };
    return this.organizationSettingsService.create(dto, userOrg);
  }

  @Get()
  @Permissions("VIEW_ORGANIZATION_SETTINGS")
  findAll(@Query() query: PaginationDto, @CurrentUser() user: any) {
    const userOrg: UserOrgContext = {
      organizationId: user?.organizationId,
      role: user?.role,
    };
    return this.organizationSettingsService.findAll(query, userOrg);
  }

  @Get("me")
  @Permissions("VIEW_ORGANIZATION_SETTINGS")
  findMine(@CurrentUser() user: any) {
    const userOrg: UserOrgContext = {
      organizationId: user?.organizationId,
      role: user?.role,
    };
    return this.organizationSettingsService.findOne(userOrg);
  }

  @Patch("me")
  @Permissions("UPDATE_ORGANIZATION_SETTINGS")
  update(@Body() dto: UpdateOrganizationSettingDto, @CurrentUser() user: any) {
    const userOrg: UserOrgContext = {
      organizationId: user?.organizationId,
      role: user?.role,
    };
    return this.organizationSettingsService.update(dto, userOrg);
  }
}
