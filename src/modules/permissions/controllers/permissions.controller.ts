import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";

import { PermissionsService } from "../services/permissions.service";

import { CreatePermissionDto } from "../dto/create-permission.dto";

import { QueryPermissionsDto } from "../dto/query-permissions.dto";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { RolesGuard } from "@modules/auth/guards/roles.guards";

import { Roles } from "@modules/auth/decorators/roles.decorator";

@Controller({
  path: "permissions",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("SUPER")
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryPermissionsDto) {
    return this.permissionsService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.permissionsService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: any) {
    return this.permissionsService.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.permissionsService.remove(id);
  }
}
