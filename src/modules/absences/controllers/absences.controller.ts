import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";

import { AbsencesService } from "@modules/absences/services/absences.service";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { CreateAbsenceDto } from "../dto/create-absence.dto";
import { UpdateAbsenceDto } from "../dto/update-absence.dto";
import { AbsenceFilterDto } from "../dto/absence-filter.dto";

@Controller({
  path: "absences",
  version: "1",
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AbsencesController {
  constructor(private readonly absencesService: AbsencesService) {}

  @Post()
  @Permissions("CREATE_ABSENCE")
  create(@Body() dto: CreateAbsenceDto, @CurrentUser() user: any) {
    return this.absencesService.create(dto, user);
  }

  @Get()
  @Permissions("VIEW_ABSENCES")
  findAll(@Query() query: AbsenceFilterDto, @CurrentUser() user: any) {
    return this.absencesService.findAll(query, user);
  }

  @Patch(":id")
  @Permissions("UPDATE_ABSENCE")
  update(@Param("id") id: string, @Body() dto: UpdateAbsenceDto, @CurrentUser() user: any) {
    return this.absencesService.update(id, dto, user);
  }
}
