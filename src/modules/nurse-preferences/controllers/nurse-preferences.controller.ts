import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";

import { NursePreferencesService } from "../services/nurse-preferences.service";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { CreateNursePreferenceDto } from "../dto/create-nurse-preference.dto";

import { UpdateNursePreferenceDto } from "../dto/update-nurse-preference.dto";

import { NursePreferenceFilterDto } from "../dto/nurse-preference-filter.dto";

@Controller({
  path: "nurse-preferences",
  version: "1",
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NursePreferencesController {
  constructor(
    private readonly nursePreferencesService: NursePreferencesService,
  ) {}

  @Post()
  @Permissions("CREATE_NURSE_PREFERENCE")
  create(@Body() dto: CreateNursePreferenceDto, @CurrentUser() user: any) {
    return this.nursePreferencesService.create(dto, user);
  }

  @Get()
  @Permissions("VIEW_NURSE_PREFERENCES")
  findAll(@Query() query: NursePreferenceFilterDto, @CurrentUser() user: any) {
    return this.nursePreferencesService.findAll(query, user);
  }

  @Patch(":id")
  @Permissions("UPDATE_NURSE_PREFERENCE")
  update(@Param("id") id: string, @Body() dto: UpdateNursePreferenceDto, @CurrentUser() user: any) {
    return this.nursePreferencesService.update(id, dto, user);
  }
}
