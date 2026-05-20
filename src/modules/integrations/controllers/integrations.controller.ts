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

import { IntegrationsService } from "../services/integrations.service";

import { CreateIntegrationDto } from "../dto/create-integration.dto";
import { UpdateIntegrationDto } from "../dto/update-integration.dto";

@Controller({
  path: "integrations",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "SUPER")
export class IntegrationsController {
  constructor(private readonly service: IntegrationsService) {}

  @Post()
  create(@Body() dto: CreateIntegrationDto) {
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
  update(@Param("id") id: string, @Body() dto: UpdateIntegrationDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
