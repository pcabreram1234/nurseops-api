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

import { QueryRolesDto } from "../dto/query-roles.dto";

import { AssignPermissionsDto } from "../dto/assign-permissions.dto";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { RolesGuard } from "@modules/auth/guards/roles.guards";

import { Roles } from "@modules/auth/decorators/roles.decorator";

@Controller({
  path: "roles",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "SUPER")
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto, @Req() req: any) {
    return this.rolesService.create(createRoleDto, req.user);
  }

  @Get()
  findAll(@Query() query: QueryRolesDto, @Req() req: any) {
    return this.rolesService.findAll(query, req.user);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Req() req: any) {
    return this.rolesService.findOne(id, req.user);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: any, @Req() req: any) {
    return this.rolesService.update(id, body, req.user);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Req() req: any) {
    return this.rolesService.remove(id, req.user);
  }

  /*
  |--------------------------------------------------------------------------
  | ASSIGN PERMISSIONS
  |--------------------------------------------------------------------------
  */

  @Patch(":id/permissions")
  assignPermissions(
    @Param("id") id: string,
    @Req() req: any,
    @Body() dto: AssignPermissionsDto,
  ) {
    return this.rolesService.assignPermissions(id, dto, req.user);
  }
}
