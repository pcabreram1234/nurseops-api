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

@Controller({
  path: "users",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles("ADMIN")
  create(
    @Body()
    createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles("ADMIN", "SUPERVISOR")
  findAll(
    @Query()
    query: QueryUsersDto,
  ) {
    return this.usersService.findAll(query);
  }

  @Get(":id")
  @Roles("ADMIN", "SUPERVISOR")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  @Roles("ADMIN")
  update(
    @Param("id") id: string,

    @Body()
    updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @Roles("ADMIN")
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }
}
