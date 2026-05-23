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
import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

@Controller({
  path: "users",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @Roles("ADMIN", "SUPER")
  create(@Body() createUserDto: CreateUserDto,) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles("ADMIN", "SUPER")
  findAll(@Query() query: QueryUsersDto, @CurrentUser() user: any) {
    return this.usersService.findAll(query, user);
  }

  @Get(":id")
  @Roles("ADMIN", "SUPER")
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.usersService.findOne(id, user);
  }

  @Patch(":id")
  @Roles("ADMIN", "SUPER")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto, @CurrentUser() user: any) {
    return this.usersService.update(id, updateUserDto, user);
  }

  @Delete(":id")
  @Roles("ADMIN", "SUPER")
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.usersService.remove(id, user);
  }
}
