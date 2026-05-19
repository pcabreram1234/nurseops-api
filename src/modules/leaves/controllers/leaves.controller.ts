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

import { LeavesService } from "@modules/leaves/services/leaves.service";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { CreateLeaveDto } from "../dto/create-leave.dto";
import { UpdateLeaveDto } from "../dto/update-leave.dto";
import { LeaveFilterDto } from "../dto/leave-filter.dto";

@Controller({
  path: "leaves",
  version: "1",
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post()
  @Permissions("CREATE_LEAVE")
  create(@Body() dto: CreateLeaveDto, @CurrentUser() user: any) {
    return this.leavesService.create(dto, user);
  }

  @Get()
  @Permissions("VIEW_LEAVES")
  findAll(@Query() query: LeaveFilterDto, @CurrentUser() user: any) {
    return this.leavesService.findAll(query, user);
  }

  @Patch(":id")
  @Permissions("UPDATE_LEAVE")
  update(@Param("id") id: string, @Body() dto: UpdateLeaveDto, @CurrentUser() user: any) {
    return this.leavesService.update(id, dto, user);
  }
}
