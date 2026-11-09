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

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { ShiftTemplatesService } from "../services/shift-templates.service";

import { CreateShiftTemplateDto } from "../dto/create-shift-template.dto";
import { UpdateShiftTemplateDto } from "../dto/update-shift-template.dto";

import { PERMISSIONS } from "@modules/permissions/constants/permissions.constants";

@Controller({
  path: "shift-templates",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles("ADMIN", "SUPER")
export class ShiftTemplatesController {
  constructor(private readonly service: ShiftTemplatesService) { }

  @Post()
  @Roles("ADMIN", "SUPER")
  @Permissions(PERMISSIONS.SHIFT_TEMPLATES.CREATE)
  create(@Body() dto: CreateShiftTemplateDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Get()
  @Roles("ADMIN", "SUPER")
  @Permissions(PERMISSIONS.SHIFT_TEMPLATES.READ)
  findAll(@CurrentUser() user: any, @Query() query: any = {}) {
    return this.service.findAll(query, user);
  }

  @Get(":id")
  @Roles("ADMIN", "SUPER")
  @Permissions(PERMISSIONS.SHIFT_TEMPLATES.READ)
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Patch(":id")
  @Roles("ADMIN", "SUPER")
  @Permissions(PERMISSIONS.SHIFT_TEMPLATES.UPDATE)
  update(@Param("id") id: string, @Body() dto: UpdateShiftTemplateDto, @CurrentUser() user: any) {
    return this.service.update(id, dto, user);
  }

  @Delete(":id")
  @Roles("ADMIN", "SUPER")
  @Permissions(PERMISSIONS.SHIFT_TEMPLATES.DELETE)
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user);
  }
}
