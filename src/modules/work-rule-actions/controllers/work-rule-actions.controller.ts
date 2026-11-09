import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { RolesGuard } from "@modules/auth/guards/roles.guards";

import { Roles } from "@modules/auth/decorators/roles.decorator";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { WorkRuleActionsService } from "@modules/work-rule-actions/services/work-rule-actions.service";

import { ActionExecutorService } from "../services/action-executor.service";

import { CreateWorkRuleActionDto } from "../dto/create-work-rule-action.dto";

import { UpdateWorkRuleActionDto } from "../dto/update-work-rule-action.dto";

import { ExecuteWorkRuleActionDto } from "../dto/execute-work-rule-action.dto";

import { WorkRuleActionFilterDto } from "../dto/work-rule-action-filter.dto";

import { PERMISSIONS } from "@modules/permissions/constants/permissions.constants";

@Controller({
  path: "work-rule-actions",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles("SUPER", "ADMIN",)
export class WorkRuleActionsController {
  constructor(
    private readonly workRuleActionsService: WorkRuleActionsService,

    private readonly actionExecutorService: ActionExecutorService,
  ) { }

  /*
  |--------------------------------------------------------------------------
  | CREATE
  |--------------------------------------------------------------------------
  */

  @Post()
  @Permissions(PERMISSIONS.WORK_RULE_ACTIONS.CREATE)
  async create(@Body() dto: CreateWorkRuleActionDto) {
    return this.workRuleActionsService.create(dto);
  }

  /*
  |--------------------------------------------------------------------------
  | FIND ALL
  |--------------------------------------------------------------------------
  */

  @Get()
  @Permissions(PERMISSIONS.WORK_RULE_ACTIONS.READ)
  async findAll(@Query() filters: WorkRuleActionFilterDto) {
    return this.workRuleActionsService.findAll(filters.workRuleId as string);
  }

  /*
  |--------------------------------------------------------------------------
  | FIND ONE
  |--------------------------------------------------------------------------
  */

  @Get(":id")
  @Permissions(PERMISSIONS.WORK_RULE_ACTIONS.READ)
  async findOne(@Param("id") id: string) {
    return this.workRuleActionsService.findOne(id);
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE
  |--------------------------------------------------------------------------
  */

  @Patch(":id")
  @Permissions(PERMISSIONS.WORK_RULE_ACTIONS.UPDATE)
  async update(@Param("id") id: string, @Body() dto: UpdateWorkRuleActionDto) {
    return this.workRuleActionsService.update(id, dto);
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  @Delete(":id")
  @Permissions(PERMISSIONS.WORK_RULE_ACTIONS.DELETE)
  async remove(@Param("id") id: string) {
    return this.workRuleActionsService.remove(id);
  }

  /*
  |--------------------------------------------------------------------------
  | EXECUTE ACTION
  |--------------------------------------------------------------------------
  */

  @Post(":id/execute")
  @Permissions(PERMISSIONS.WORK_RULE_ACTIONS.UPDATE)
  async execute(
    @Param("id") id: string,
    @Body() dto: ExecuteWorkRuleActionDto,
  ) {
    /*
    |--------------------------------------------------------------------------
    | FIND ACTION
    |--------------------------------------------------------------------------
    */

    const action = await this.workRuleActionsService.findOne(id);

    /*
    |--------------------------------------------------------------------------
    | EXECUTE
    |--------------------------------------------------------------------------
    */

    return this.actionExecutorService.execute(
      action,

      dto.payload || {},
    );
  }
}
