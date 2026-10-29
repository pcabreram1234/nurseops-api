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

import { ShiftTemplatesService } from "../services/shift-templates.service";

import { CreateShiftTemplateDto } from "../dto/create-shift-template.dto";
import { UpdateShiftTemplateDto } from "../dto/update-shift-template.dto";

@Controller({
  path: "shift-templates",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "SUPER")
export class ShiftTemplatesController {
  constructor(private readonly service: ShiftTemplatesService) { }

  @Post()
  create(@Body() dto: CreateShiftTemplateDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query() query: any = {}) {
    return this.service.findAll(query, user);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateShiftTemplateDto, @CurrentUser() user: any) {
    return this.service.update(id, dto, user);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user);
  }
}
