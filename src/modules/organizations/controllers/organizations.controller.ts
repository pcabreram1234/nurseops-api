import { Body, Controller, Patch, Post, Get, Param, Delete, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";

import { RolesGuard } from "@modules/auth/guards/roles.guards";

import { Roles } from "@modules/auth/decorators/roles.decorator";

import { OrganizationsService } from "../services/organizations.service";

import { CreateOrganizationDto } from "../dto/create-organization.dto";

import { UpdateOrganizationDto } from "../dto/update-organization.dto";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";
import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

@Controller({
  path: "organizations",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles("SUPER", "ADMIN", "SUPERVISOR")
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
  findAll(@CurrentUser() user: any) {
    return this.organizationsService.findAll(user);
  }

  @Get(":id")
  @Roles("SUPER", "ADMIN", "SUPERVISOR")
  @Permissions("READ_ORGANIZATION")
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.organizationsService.findOne(id, user);
  }

  @Patch(":id")
  @Permissions("UPDATE-ORGANIZATION")
  update(
    @Param("id") id: string,
    @Body()
    updateOrganizationDto: UpdateOrganizationDto, @CurrentUser() user: any
  ) {
    return this.organizationsService.update(id, updateOrganizationDto, user);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.organizationsService.remove(id, user);
  }
}
