import { Body, Controller, Patch, Post, Get,Param,Delete, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";

import { RolesGuard } from "@modules/auth/guards/roles.guards";

import { Roles } from "@modules/auth/decorators/roles.decorator";

import { OrganizationsService } from "../services/organizations.service";

import { CreateOrganizationDto } from "../dto/create-organization.dto";

import { UpdateOrganizationDto } from "../dto/update-organization.dto";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

@Controller({
  path: "organizations",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @Roles("SUPER")
  @Permissions("CREATE-ORGANIZATION")
  create(
    @Body()
    createOrganizationDto: CreateOrganizationDto,
  ) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  @Roles("SUPER","ADMIN")
  @Permissions("READ_ORGANIZATION")
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get(":id")
  @Roles("SUPER", "ADMIN","SUPERVISOR")
  @Permissions("READ_ORGANIZATION")
  findOne(@Param("id") id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch(":id")
  @Roles("SUPER","ADMIN")
  @Permissions("UPDATE-ORGANIZATION")
  update(
    @Param("id") id: string,

    @Body()
    updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Delete(":id")
  @Roles("SUPER")
  remove(@Param("id") id: string) {
    return this.organizationsService.remove(id);
  }
}
