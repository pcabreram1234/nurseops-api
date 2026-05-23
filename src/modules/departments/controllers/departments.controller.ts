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

import { DepartmentsService } from "../services/departments.service";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { CreateDepartmentDto } from "../dto/create-department.dto";

import { UpdateDepartmentDto } from "../dto/update-department.dto";

import { DepartmentFilterDto } from "../dto/department-filter.dto";

import { AssignNursesDto } from "../dto/assign-nurses.dto";

@Controller({
  path: "departments",
  version: "1",
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) { }

  /*
  |--------------------------------------------------------------------------
  | CREATE
  |--------------------------------------------------------------------------
  */

  @Post()
  @Permissions("CREATE_DEPARTMENT")
  create(@Body() dto: CreateDepartmentDto) {
    return this.departmentsService.create(dto);
  }

  /*
  |--------------------------------------------------------------------------
  | FIND ALL
  |--------------------------------------------------------------------------
  */

  @Get()
  @Permissions("VIEW_DEPARTMENTS")
  findAll(@Query() query: DepartmentFilterDto, @CurrentUser() user: any) {
    return this.departmentsService.findAll(query, user);
  }

  /*
  |--------------------------------------------------------------------------
  | FIND ONE
  |--------------------------------------------------------------------------
  */

  @Get(":id")
  @Permissions("VIEW_DEPARTMENT")
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.departmentsService.findOne(id, user);
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE
  |--------------------------------------------------------------------------
  */

  @Patch(":id")
  @Permissions("UPDATE_DEPARTMENT")
  update(@Param("id") id: string, @Body() dto: UpdateDepartmentDto, @CurrentUser() user: any,) {
    return this.departmentsService.update(id, dto, user);
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  @Delete(":id")
  @Permissions("DELETE_DEPARTMENT")
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.departmentsService.remove(id, user);
  }

  /*
  |--------------------------------------------------------------------------
  | ASSIGN NURSES
  |--------------------------------------------------------------------------
  */

  @Patch(":id/assign-nurses")
  @Permissions("ASSIGN_NURSES_DEPARTMENT")
  assignNurses(@Param("id") id: string, @Body() dto: AssignNursesDto, @CurrentUser() user: any,
  ) {
    return this.departmentsService.assignNurses(id, dto, user);
  }
}
