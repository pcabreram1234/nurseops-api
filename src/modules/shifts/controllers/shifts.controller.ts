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

import { ShiftsService } from "../services/shifts.service";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { CreateShiftDto } from "../dto/create-shift.dto";

import { UpdateShiftDto } from "../dto/update-shift.dto";

import { ShiftFilterDto } from "../dto/shift-filter.dto";

@Controller({
  path: "shifts",
  version: "1",
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post()
  @Permissions("CREATE_SHIFT")
  create(@Body() dto: CreateShiftDto) {
    return this.shiftsService.create(dto);
  }

  @Get()
  @Permissions("VIEW_SHIFTS")
  findAll(@Query() query: ShiftFilterDto, @CurrentUser() user: any) {
    return this.shiftsService.findAll(query, user);
  }

  @Get(":id")
  @Permissions("VIEW_SHIFT")
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.shiftsService.findOne(id, user);
  }

  @Patch(":id")
  @Permissions("UPDATE_SHIFT")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateShiftDto,
    @CurrentUser() user: any,
  ) {
    return this.shiftsService.update(id, dto, user);
  }

  @Delete(":id")
  @Permissions("DELETE_SHIFT")
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.shiftsService.remove(id, user);
  }
}
