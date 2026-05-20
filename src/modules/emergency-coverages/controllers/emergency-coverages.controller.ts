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

import { EmergencyCoveragesService } from "../services/emergency-coverages.service";

import { CreateEmergencyCoverageDto } from "../dto/create-emergency-coverage.dto";
import { UpdateEmergencyCoverageDto } from "../dto/update-emergency-coverage.dto";

@Controller({
  path: "emergency-coverages",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "SUPERVISOR")
export class EmergencyCoveragesController {
  constructor(private readonly service: EmergencyCoveragesService) {}

  @Post()
  create(@Body() dto: CreateEmergencyCoverageDto) {
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
  update(@Param("id") id: string, @Body() dto: UpdateEmergencyCoverageDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
