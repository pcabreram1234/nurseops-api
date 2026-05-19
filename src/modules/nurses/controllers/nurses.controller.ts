import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";

import { NursesService } from "@modules/nurses/services/nurses.service";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { CreateNurseDto } from "../dto/create-nurse.dto";

import { UpdateNurseDto } from "../dto/update-nurse.dto";

import { NurseFilterDto } from "../dto/nurse-filter.dto";

@Controller({
  path: "nurses",
  version: "1",
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NursesController {
  constructor(private readonly nursesService: NursesService) {}

  @Post()
  @Permissions("CREATE_NURSE")
  create(@Body() dto: CreateNurseDto, @CurrentUser() user: any) {
    return this.nursesService.create(dto, user);
  }

  @Get()
  @Permissions("VIEW_NURSES")
  findAll(@Query() query: NurseFilterDto, @CurrentUser() user: any) {
    return this.nursesService.findAll(query, user);
  }

  @Get(":id")
  @Permissions("VIEW_NURSE")
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.nursesService.findOne(id, user);
  }

  @Patch(":id")
  @Permissions("UPDATE_NURSE")
  update(@Param("id") id: string, @Body() dto: UpdateNurseDto, @CurrentUser() user: any) {
    return this.nursesService.update(id, dto, user);
  }

  @Delete(":id")
  @Permissions("DELETE_NURSE")
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.nursesService.remove(id, user);
  }
}
