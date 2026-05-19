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

import { EmergencyCandidatesService } from "@modules/emergency-candidates/services/emergency-candidates.service";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

@Controller({
  path: "emergency-candidates",
  version: "1",
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EmergencyCandidatesController {
  constructor(
    private readonly emergencyCandidatesService: EmergencyCandidatesService,
  ) {}

  @Post()
  @Permissions("CREATE_EMERGENCY_CANDIDATE")
  create(
    @Body() dto: any,

    @CurrentUser() user: any,
  ) {
    return this.emergencyCandidatesService.create(dto, user);
  }

  @Get()
  @Permissions("VIEW_EMERGENCY_CANDIDATES")
  findAll(
    @Query() query: any,

    @CurrentUser() user: any,
  ) {
    return this.emergencyCandidatesService.findAll(query, user);
  }

  @Patch(":id")
  @Permissions("UPDATE_EMERGENCY_CANDIDATE")
  update(
    @Param("id") id: string,

    @Body() dto: any,

    @CurrentUser() user: any,
  ) {
    return this.emergencyCandidatesService.update(id, dto, user);
  }
}
