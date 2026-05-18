import { Body, Controller, Patch, Post, Get,Param,Delete, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";

import { RolesGuard } from "@modules/auth/guards/roles.guards";

import { Roles } from "@modules/auth/decorators/roles.decorator";

import { OrganizationsService } from "../services/organizations.service";

import { CreateOrganizationDto } from "../dto/create-organization.dto";

import { UpdateOrganizationDto } from "../dto/update-organization.dto";

@Controller({
  path: "organizations",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @Roles("ADMIN")
  create(
    @Body()
    createOrganizationDto: CreateOrganizationDto,
  ) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  @Roles("ADMIN")
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get(":id")
  @Roles("ADMIN", "SUPERVISOR")
  findOne(@Param("id") id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch(":id")
  @Roles("ADMIN")
  update(
    @Param("id") id: string,

    @Body()
    updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Delete(":id")
  @Roles("ADMIN")
  remove(@Param("id") id: string) {
    return this.organizationsService.remove(id);
  }
}
