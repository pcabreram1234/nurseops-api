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

import { UsersService } from "../services/users.service";

import { CreateUserDto } from "../dto/create-user.dto";

import { UpdateUserDto } from "../dto/update-user.dto";

import { QueryUsersDto } from "../dto/query-users.dto";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { RolesGuard } from "@modules/auth/guards/roles.guards";

import { Roles } from "@modules/auth/decorators/roles.decorator";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { PERMISSIONS } from "@modules/permissions/constants/permissions.constants";

@Controller({
  path: "users",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @Roles("ADMIN", "SUPER")
  @Permissions(PERMISSIONS.USERS.CREATE)
  create(@Body() createUserDto: CreateUserDto, @CurrentUser() user: any) {
    return this.usersService.create(createUserDto, user);
  }

  @Get()
  @Roles("ADMIN", "SUPER")
  @Permissions(PERMISSIONS.USERS.READ)
  findAll(@Query() query: QueryUsersDto, @CurrentUser() user: any) {
    return this.usersService.findAll(query, user);
  }

  @Get(":id")
  @Roles("ADMIN", "SUPER")
  @Permissions(PERMISSIONS.USERS.READ)
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.usersService.findOne(id, user);
  }

  @Patch(":id")
  @Roles("ADMIN", "SUPER")
  @Permissions(PERMISSIONS.USERS.UPDATE)
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto, @CurrentUser() user: any) {
    return this.usersService.update(id, updateUserDto, user);
  }

  @Delete(":id")
  @Roles("ADMIN", "SUPER")
  @Permissions(PERMISSIONS.USERS.DELETE)
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.usersService.remove(id, user);
  }
}
