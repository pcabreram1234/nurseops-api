import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";

import { ScheduleEntriesService } from "../services/schedule-entries.service";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { CreateScheduleEntryDto } from "../dto/create-schedule-entry.dto";

import { UpdateScheduleEntryDto } from "../dto/update-schedule-entry.dto";

import { ScheduleEntryFilterDto } from "../dto/schedule-entry-filter.dto";

@Controller({
  path: "schedule-entries",
  version: "1",
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ScheduleEntriesController {
  constructor(
    private readonly scheduleEntriesService: ScheduleEntriesService,
  ) {}

  @Post()
  @Permissions("CREATE_SCHEDULE_ENTRY")
  create(@Body() dto: CreateScheduleEntryDto, @CurrentUser() user: any) {
    return this.scheduleEntriesService.create(dto, user);
  }

  @Get()
  @Permissions("VIEW_SCHEDULE_ENTRIES")
  findAll(@Query() query: ScheduleEntryFilterDto, @CurrentUser() user: any) {
    return this.scheduleEntriesService.findAll(query, user);
  }

  @Patch(":id")
  @Permissions("UPDATE_SCHEDULE_ENTRY")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateScheduleEntryDto,
    @CurrentUser() user: any,
  ) {
    return this.scheduleEntriesService.update(id, dto, user);
  }
}
