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

import { NurseAvailabilityService } from "@modules/nurse-availability/services/nurse-availability.service";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { CreateNurseAvailabilityDto } from "../dto/create-nurse-availability.dto";
import { UpdateNurseAvailabilityDto } from "../dto/update-nurse-availability.dto";
import { NurseAvailabilityFilterDto } from "../dto/nurse-availability-filter.dto";

@Controller({
  path: "nurse-availability",
  version: "1",
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NurseAvailabilityController {
  constructor(
    private readonly nurseAvailabilityService: NurseAvailabilityService,
  ) {}

  @Post()
  @Permissions("CREATE_NURSE_AVAILABILITY")
  create(@Body() dto: CreateNurseAvailabilityDto, @CurrentUser() user: any) {
    return this.nurseAvailabilityService.create(dto, user);
  }

  @Get()
  @Permissions("VIEW_NURSE_AVAILABILITY")
  findAll(
    @Query() query: NurseAvailabilityFilterDto,
    @CurrentUser() user: any,
  ) {
    return this.nurseAvailabilityService.findAll(query, user);
  }

  @Patch(":id")
  @Permissions("UPDATE_NURSE_AVAILABILITY")
  update(@Param("id") id: string, @Body() dto: UpdateNurseAvailabilityDto, @CurrentUser() user: any) {
    return this.nurseAvailabilityService.update(id, dto, user);
  }
}
