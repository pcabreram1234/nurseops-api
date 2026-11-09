import { Body, Controller, Patch, Post, Get, Param, Delete, UseGuards, Query } from "@nestjs/common";

import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";

import { RolesGuard } from "@modules/auth/guards/roles.guards";

import { Roles } from "@modules/auth/decorators/roles.decorator";

import { OrganizationsService, UserOrgContext } from "../services/organizations.service";

import { CreateOrganizationDto } from "../dto/create-organization.dto";

import { UpdateOrganizationDto } from "../dto/update-organization.dto";

import { PaginationDto } from "../dto/pagination.dto";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";
import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

@Controller({
  path: "organizations",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles("SUPER", "SYSTEM_ADMIN","HR_MANAGER")
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) { }

  @Post()
  @Roles("SUPER")
  @Permissions("CREATE-ORGANIZATION")
  create(@Body() createOrganizationDto: CreateOrganizationDto,) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  @Permissions("READ_ORGANIZATION")
  findAll(@Query() query: PaginationDto, @CurrentUser() user: any) {
    const userOrg: UserOrgContext = {
      organizationId: user?.organizationId,
      role: user?.role,
    };
    return this.organizationsService.findAll(query, userOrg);
  }

  @Get(":id")
  @Permissions("READ_ORGANIZATION")
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    const userOrg: UserOrgContext = {
      organizationId: user?.organizationId,
      role: user?.role,
    };
    return this.organizationsService.findOne(id, userOrg);
  }

  @Patch(":id")
  @Permissions("UPDATE-ORGANIZATION")
  update(
    @Param("id") id: string,
    @Body()
    updateOrganizationDto: UpdateOrganizationDto, @CurrentUser() user: any
  ) {
    const userOrg: UserOrgContext = {
      organizationId: user?.organizationId,
      role: user?.role,
    };
    return this.organizationsService.update(id, updateOrganizationDto, userOrg);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    const userOrg: UserOrgContext = {
      organizationId: user?.organizationId,
      role: user?.role,
    };
    return this.organizationsService.remove(id, userOrg);
  }
}
