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

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { EmergencyCoveragesService } from "../services/emergency-coverages.service";

import { CreateEmergencyCoverageDto } from "../dto/create-emergency-coverage.dto";
import { UpdateEmergencyCoverageDto } from "../dto/update-emergency-coverage.dto";

@Controller({
  path: "emergency-coverages",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "SUPERVISOR", "SUPER")
export class EmergencyCoveragesController {
  constructor(private readonly service: EmergencyCoveragesService) { }

  @Post()
  create(@Body() dto: CreateEmergencyCoverageDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query() query: any = {}) {
    return this.service.findAll(user.organizationId, query);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateEmergencyCoverageDto, @CurrentUser() user: any) {
    return this.service.update(id, dto, user);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user);
  }
}
