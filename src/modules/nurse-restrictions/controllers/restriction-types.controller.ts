import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";

import { RestrictionTypesService } from "../services/restriction-types.service";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

@Controller({
  path: "restriction-types",
  version: "1",
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RestrictionTypesController {
  constructor(
    private readonly restrictionTypesService: RestrictionTypesService,
  ) {}

  @Post()
  @Permissions("CREATE_RESTRICTION_TYPE")
  create(@Body() dto: any) {
    return this.restrictionTypesService.create(dto);
  }

  @Get()
  @Permissions("VIEW_RESTRICTION_TYPES")
  findAll() {
    return this.restrictionTypesService.findAll();
  }

  @Patch(":id")
  @Permissions("UPDATE_RESTRICTION_TYPE")
  update(
    @Param("id") id: string,

    @Body() dto: any,
  ) {
    return this.restrictionTypesService.update(id, dto);
  }

  @Delete(":id")
  @Permissions("DELETE_RESTRICTION_TYPE")
  remove(@Param("id") id: string) {
    return this.restrictionTypesService.remove(id);
  }
}
