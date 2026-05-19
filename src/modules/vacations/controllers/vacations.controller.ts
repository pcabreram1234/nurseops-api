import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";

import { VacationsService } from "../services/vacations.service";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { CreateVacationDto } from "../dto/create-vacation.dto";
import { VacationFilterDto } from "../dto/vacation-filter.dto";
import { UpdateVacationDto } from "../dto/update-vacation.dto";
import { ApproveVacationDto } from "../dto/approve-vacation.dto";

@Controller({
  path: "vacations",
  version: "1",
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class VacationsController {
  constructor(private readonly vacationsService: VacationsService) {}

  @Post()
  @Permissions("CREATE_VACATION")
  create(@Body() dto: CreateVacationDto, @CurrentUser() user: any) {
    return this.vacationsService.create(dto, user);
  }

  @Get()
  @Permissions("VIEW_VACATIONS")
  findAll(@Query() query: VacationFilterDto, @CurrentUser() user: any) {
    return this.vacationsService.findAll(query, user);
  }

  @Get(":id")
  @Permissions("VIEW_VACATION")
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.vacationsService.findOne(id, user);
  }

  @Patch(":id")
  @Permissions("UPDATE_VACATION")
  update(@Param("id") id: string, @Body() dto: UpdateVacationDto, @CurrentUser() user: any) {
    return this.vacationsService.update(id, dto, user);
  }

  @Patch(":id/approve")
  @Permissions("APPROVE_VACATION")
  approve(@Param("id") id: string, @Body() dto: ApproveVacationDto, @CurrentUser() user: any) {
    return this.vacationsService.approve(id, dto, user);
  }

  @Delete(":id")
  @Permissions("DELETE_VACATION")
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.vacationsService.remove(id, user);
  }
}
