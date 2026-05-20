import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from "@nestjs/common";

import { SchedulesService } from "../services/schedules.service";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { CreateScheduleDto } from "../dto/create-schedule.dto";

import { UpdateScheduleDto } from "../dto/update-schedule.dto";

import { ScheduleFilterDto } from "../dto/schedule-filter.dto";

@Controller({
  path: "schedules",
  version: "1",
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @Permissions("CREATE_SCHEDULE")
  create(@Body() dto: CreateScheduleDto) {
    return this.schedulesService.create(dto);
  }

  @Get()
  @Permissions("VIEW_SCHEDULES")
  findAll(@Query() query: ScheduleFilterDto, @CurrentUser() user: any) {
    return this.schedulesService.findAll(query, user);
  }

  @Get(":id")
  @Permissions("VIEW_SCHEDULE")
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.schedulesService.findOne(id, user);
  }

  @Patch(":id")
  @Permissions("UPDATE_SCHEDULE")
  update(@Param("id") id: string,@Body() dto: UpdateScheduleDto, @CurrentUser() user: any,) {
    return this.schedulesService.update(id, dto, user);
  }

  @Delete(":id")
  @Permissions("DELETE_SCHEDULE")
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.schedulesService.remove(id, user);
  }


  @Post(":id/generate")
  @Permissions("GENERATE_SCHEDULE")
  generate(@Param("id") id: string, @CurrentUser() user: any,) {
    return this.schedulesService.generate(id, user);
  }
}
