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

import { SpecialitiesService } from "../services/specialities.service";

import { CreateSpecialityDto } from "../dto/create-speciality.dto";
import { UpdateSpecialityDto } from "../dto/update-speciality.dto";

@Controller({
  path: "specialities",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "SUPERVISOR")
export class SpecialitiesController {
  constructor(private readonly service: SpecialitiesService) {}

  @Post()
  create(@Body() dto: CreateSpecialityDto) {
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
  update(@Param("id") id: string, @Body() dto: UpdateSpecialityDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
