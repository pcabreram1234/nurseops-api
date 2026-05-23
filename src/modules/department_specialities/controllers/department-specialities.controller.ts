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

import { DepartmentSpecialitiesService } from "../services/department-specialities.service";

import { AssignSpecialityToDepartmentDto } from "../dto/assign-speciality-to-department.dto";

@Controller({
  path: "department-specialities",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "SUPERVISOR", "SUPER")
export class DepartmentSpecialitiesController {
  constructor(private readonly service: DepartmentSpecialitiesService) { }

  @Post()
  assign(@Body() dto: AssignSpecialityToDepartmentDto) {
    return this.service.assign(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Delete(":departmentId/:specialityId")
  remove(@Param("departmentId") departmentId: string, @Param("specialityId") specialityId: string,
  ) {
    return this.service.remove(departmentId, specialityId);
  }
}
