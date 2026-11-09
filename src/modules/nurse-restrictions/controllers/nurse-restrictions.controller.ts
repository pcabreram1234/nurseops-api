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

import { NurseRestrictionsService } from "../services/nurse-restrictions.service";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";
import { Permissions } from "@modules/auth/decorators/permissions.decorator";
import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";
import { Roles } from "@modules/auth/decorators/roles.decorator";

import { CreateNurseRestrictionDto } from "../dto/create-nurse-restriction.dto";
import { UpdateNurseRestrictionDto } from "../dto/update-nurse-restriction.dto";
import { SyncNurseRestrictionDto } from "../dto/sync-nurse-restriction.dto";
import { NurseRestrictionFilterDto } from "../dto/nurse-restriction-filter.dto";

@Controller({
  path: "nurse-restrictions",
  version: "1",
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NurseRestrictionsController {
  constructor(
    private readonly nurseRestrictionsService: NurseRestrictionsService,
  ) { }

  @Post("sync")
  @Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER")
  @Permissions("CREATE_NURSE_RESTRICTION")
  syncRestrictions(@Body() dto: SyncNurseRestrictionDto, @CurrentUser() user: any) {
    const payload = {
      ...dto,
      organizationId: user.organizationId
    };
    return this.nurseRestrictionsService.syncRestriction(payload);
  }

  @Post()
  @Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER")
  @Permissions("CREATE_NURSE_RESTRICTION")
  create(@Body() dto: CreateNurseRestrictionDto, @CurrentUser() user: any) {
    return this.nurseRestrictionsService.create(dto, user);
  }

  @Get()
  @Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER", "SUPERVISOR", "NIGHT_SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR", "TEMP_NURSE")
  @Permissions("VIEW_NURSE_RESTRICTIONS")
  findAll(@Query() query: NurseRestrictionFilterDto, @CurrentUser() user: any) {
    return this.nurseRestrictionsService.findAll(query, user);
  }

  @Patch(":id")
  @Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER")
  @Permissions("UPDATE_NURSE_RESTRICTION")
  update(@Param("id") id: string, @Body() dto: UpdateNurseRestrictionDto, @CurrentUser() user: any) {
    return this.nurseRestrictionsService.update(id, dto, user);
  }

  @Delete(":id")
  @Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER")
  @Permissions("DELETE_NURSE_RESTRICTION")
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.nurseRestrictionsService.remove(id, user);
  }
}