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

@Controller({
  path: "roles",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("SUPER")
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  findAll(@Query() query: QueryRolesDto, @Req() req: any) {
    return this.rolesService.findAll(query, req.user);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: UpdateRoleDto) {
    return this.rolesService.update(id, body,);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Req() req: any) {
    return this.rolesService.remove(id);
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
