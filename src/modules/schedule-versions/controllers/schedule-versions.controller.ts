import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { RolesGuard } from "@modules/auth/guards/roles.guards";

import { Roles } from "@modules/auth/decorators/roles.decorator";

import { ScheduleVersionsService } from "../services/schedule-versions.service";

import { CreateScheduleVersionDto } from "../dto/create-schedule-version.dto";

@Controller({
  path: "schedule-versions",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "SUPERVISOR")
export class ScheduleVersionsController {
  constructor(private readonly service: ScheduleVersionsService) {}

  @Post()
  create(@Body() dto: CreateScheduleVersionDto) {
    return this.service.create(dto);
  }

  @Get(":scheduleId")
  findAll(@Param("scheduleId") scheduleId: string) {
    return this.service.findAll(scheduleId);
  }
}
