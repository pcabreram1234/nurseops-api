import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { RolesGuard } from "@modules/auth/guards/roles.guards";

import { Roles } from "@modules/auth/decorators/roles.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { RuleGroupsService } from "../services/rule-groups.service";
import { RuleGroupAssignmentsService } from "../services/rule-group-assignments.service";

import { CreateRuleGroupDto } from "../dto/create-rule-group.dto";
import { UpdateRuleGroupDto } from "../dto/update-rule-group.dto";
import { AssignRuleDto } from "../dto/assign-rule.dto";

@Controller({
  path: "rule-groups",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "SUPER")
export class RuleGroupsController {
  constructor(
    private readonly service: RuleGroupsService,
    private readonly assignmentsService: RuleGroupAssignmentsService,
  ) { }

  @Post()
  create(@Body() dto: CreateRuleGroupDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.service.findAll(user.organizationId);
  }

  /**
   * Asigna una regla de negocio a este grupo (dependencia #6 del plan).
   * Exponía el servicio pero no tenía ruta HTTP.
   */
  @Post(":id/assignments")
  assignRule(@Param("id") id: string, @Body() dto: AssignRuleDto) {
    return this.assignmentsService.assignRule(id, dto);
  }

  /**
   * Quita una regla de su grupo. Ruta con prefijo explícito para no
   * competir con `DELETE :id`.
   */
  @Delete(":id/assignments/:assignmentId")
  removeAssignment(
    @Param("id") id: string,
    @Param("assignmentId") assignmentId: string,
  ) {
    return this.assignmentsService.removeAssignment(assignmentId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateRuleGroupDto, @CurrentUser() user: any) {
    return this.service.update(id, dto, user);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user);
  }
}
