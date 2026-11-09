import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@modules/auth/guards/roles.guards";
import { Roles } from "@modules/auth/decorators/roles.decorator";
import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";
import { ShiftChangePoliciesService } from "./shift-change-policies.service";
import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";
import { Permissions } from "@modules/auth/decorators/permissions.decorator";
import { PERMISSIONS } from "@modules/permissions/constants/permissions.constants";

@Controller({
  path: "shift-change-policies",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class ShiftChangePoliciesController {
  constructor(private readonly service: ShiftChangePoliciesService) {}

  @Post()
  @Roles("SUPER", "ADMIN")
  @Permissions(PERMISSIONS.SHIFT_CHANGE_POLICY.CREATE)
  create(@Body() dto: any, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Get()
  @Roles("SUPER", "ADMIN", "SUPERVISOR")
  @Permissions(PERMISSIONS.SHIFT_CHANGE_POLICY.READ)
  findAll(@Query() query: any, @CurrentUser() user: any) {
    return this.service.findAll(query, user);
  }

  @Get(":id")
  @Roles("SUPER", "ADMIN", "SUPERVISOR")
  @Permissions(PERMISSIONS.SHIFT_CHANGE_POLICY.READ)
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Put(":id")
  @Roles("SUPER", "ADMIN")
  @Permissions(PERMISSIONS.SHIFT_CHANGE_POLICY.UPDATE)
  update(@Param("id") id: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.service.update(id, dto, user);
  }

  @Delete(":id")
  @Roles("SUPER")
  @Permissions(PERMISSIONS.SHIFT_CHANGE_POLICY.DELETE)
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user);
  }
}
