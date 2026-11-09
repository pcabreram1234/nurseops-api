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
  Req,
} from "@nestjs/common";

import { RolesService } from "../services/roles.service";

import { CreateRoleDto } from "../dto/create-role.dto";

import { UpdateRoleDto } from "../dto/update-role.dto";

import { QueryRolesDto } from "../dto/query-roles.dto";

import { AssignPermissionsDto } from "../dto/assign-permissions.dto";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { RolesGuard } from "@modules/auth/guards/roles.guards";

import { Roles } from "@modules/auth/decorators/roles.decorator";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { PERMISSIONS } from "@modules/permissions/constants/permissions.constants";

@Controller({
  path: "roles",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles("SUPER")
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @Post()
  @Permissions(PERMISSIONS.ROLES.MANAGE)
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @Permissions(PERMISSIONS.ROLES.MANAGE)
  findAll(@Query() query: QueryRolesDto, @Req() req: any) {
    return this.rolesService.findAll(query, req.user);
  }

  @Get(":id")
  @Permissions(PERMISSIONS.ROLES.MANAGE)
  findOne(@Param("id") id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(":id")
  @Permissions(PERMISSIONS.ROLES.MANAGE)
  update(@Param("id") id: string, @Body() body: UpdateRoleDto) {
    return this.rolesService.update(id, body,);
  }

  @Delete(":id")
  @Permissions(PERMISSIONS.ROLES.MANAGE)
  remove(@Param("id") id: string, @Req() req: any) {
    return this.rolesService.remove(id);
  }

  /*
  |--------------------------------------------------------------------------
  | ASSIGN PERMISSIONS
  |--------------------------------------------------------------------------
  */

  @Patch(":id/permissions")
  @Permissions(PERMISSIONS.ROLES.MANAGE)
  assignPermissions(
    @Param("id") id: string,
    @Req() req: any,
    @Body() dto: AssignPermissionsDto,
  ) {
    return this.rolesService.assignPermissions(id, dto, req.user);
  }
}
