import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { RolesGuard } from "@modules/auth/guards/roles.guards";

import { Roles } from "@modules/auth/decorators/roles.decorator";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { DepartmentSpecialitiesService } from "../services/department-specialities.service";

import { AssignSpecialityToDepartmentDto } from "../dto/assign-speciality-to-department.dto";

import { PERMISSIONS } from "@modules/permissions/constants/permissions.constants";

@Controller({
  path: "department-specialities",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class DepartmentSpecialitiesController {
  constructor(private readonly service: DepartmentSpecialitiesService) { }

  @Post()
  @Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER")
  @Permissions(PERMISSIONS.DEPARTMENTS.UPDATE)
  assign(@Body() dto: AssignSpecialityToDepartmentDto) {
    return this.service.assign(dto);
  }

  @Get()
  @Permissions(PERMISSIONS.DEPARTMENTS.READ)
  findAll() {
    return this.service.findAll();
  }

  @Delete(":departmentId/:specialityId")
  @Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER")
  @Permissions(PERMISSIONS.DEPARTMENTS.DELETE)
  remove(@Param("departmentId") departmentId: string, @Param("specialityId") specialityId: string,
  ) {
    return this.service.remove(departmentId, specialityId);
  }
}
