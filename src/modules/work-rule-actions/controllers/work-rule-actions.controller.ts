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

import { WorkRuleActionsService } from "@modules/work-rule-actions/services/work-rule-actions.service";

import { ActionExecutorService } from "../services/action-executor.service";

import { CreateWorkRuleActionDto } from "../dto/create-work-rule-action.dto";

import { UpdateWorkRuleActionDto } from "../dto/update-work-rule-action.dto";

import { ExecuteWorkRuleActionDto } from "../dto/execute-work-rule-action.dto";

import { WorkRuleActionFilterDto } from "../dto/work-rule-action-filter.dto";

@Controller({
  path: "work-rule-actions",
  version: "1",
})
@Roles("SUPER", "ADMIN",)
@UseGuards(JwtAuthGuard, RolesGuard)
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
  async create(@Body() dto: CreateWorkRuleActionDto) {
    return this.workRuleActionsService.create(dto);
  }

  /*
  |--------------------------------------------------------------------------
  | FIND ALL
  |--------------------------------------------------------------------------
  */

  @Get()
  async findAll(@Query() filters: WorkRuleActionFilterDto) {
    return this.workRuleActionsService.findAll(filters.workRuleId as string);
  }

  /*
  |--------------------------------------------------------------------------
  | FIND ONE
  |--------------------------------------------------------------------------
  */

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.workRuleActionsService.findOne(id);
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE
  |--------------------------------------------------------------------------
  */

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateWorkRuleActionDto) {
    return this.workRuleActionsService.update(id, dto);
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.workRuleActionsService.remove(id);
  }

  /*
  |--------------------------------------------------------------------------
  | EXECUTE ACTION
  |--------------------------------------------------------------------------
  */

  @Post(":id/execute")
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
