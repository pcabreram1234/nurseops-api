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

import { NurseProfilesService } from "../services/nurse-profiles.service";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { CreateNurseProfileDto } from "../dto/create-nurse-profile.dto";
import { UpdateNurseProfileDto } from "../dto/update-nurse-profile.dto";
import { NurseProfileFilterDto } from "../dto/nurse-profile-filter.dto";

@Controller({
  path: "nurse-profiles",
  version: "1",
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NurseProfilesController {
  constructor(private readonly nurseProfilesService: NurseProfilesService) {}

  @Post()
  @Permissions("CREATE_NURSE_PROFILE")
  create(@Body() dto: CreateNurseProfileDto, @CurrentUser() user: any) {
    return this.nurseProfilesService.create(dto, user);
  }

  @Get()
  @Permissions("VIEW_NURSE_PROFILES")
  findAll(@Query() query: NurseProfileFilterDto, @CurrentUser() user: any) {
    return this.nurseProfilesService.findAll(query, user);
  }

  @Get(":id")
  @Permissions("VIEW_NURSE_PROFILE")
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.nurseProfilesService.findOne(id, user);
  }

  @Patch(":id")
  @Permissions("UPDATE_NURSE_PROFILE")
  update(@Param("id") id: string, @Body() dto: UpdateNurseProfileDto, @CurrentUser() user: any) {
    return this.nurseProfilesService.update(id, dto, user);
  }
}
