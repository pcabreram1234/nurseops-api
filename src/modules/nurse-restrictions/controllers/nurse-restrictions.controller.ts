import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";

import { NurseRestrictionsService } from "../services/nurse-restrictions.service";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { CreateNurseRestrictionDto } from "../dto/create-nurse-restriction.dto";
import { UpdateNurseRestrictionDto } from "../dto/update-nurse-restriction.dto";

@Controller({
  path: "nurse-restrictions",
  version: "1",
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NurseRestrictionsController {
  constructor(
    private readonly nurseRestrictionsService: NurseRestrictionsService,
  ) {}

  @Post()
  @Permissions("CREATE_NURSE_RESTRICTION")
  create(@Body() dto: CreateNurseRestrictionDto, @CurrentUser() user: any) {
    return this.nurseRestrictionsService.create(dto, user);
  }

  @Get()
  @Permissions("VIEW_NURSE_RESTRICTIONS")
  findAll(@CurrentUser() user: any) {
    return this.nurseRestrictionsService.findAll(user);
  }

  @Patch(":id")
  @Permissions("UPDATE_NURSE_RESTRICTION")
  update(@Param("id") id: string, @Body() dto: UpdateNurseRestrictionDto, @CurrentUser() user: any) {
    return this.nurseRestrictionsService.update(id, dto, user);
  }

  @Delete(":id")
  @Permissions("DELETE_NURSE_RESTRICTION")
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.nurseRestrictionsService.remove(id, user);
  }
}
