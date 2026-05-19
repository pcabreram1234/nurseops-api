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

import { OptimizationScoresService } from "../services/optimization-scores.service";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { CreateOptimizationScoreDto } from "../dto/create-optimization-score.dto";

import { UpdateOptimizationScoreDto } from "../dto/update-optimization-score.dto";

import { OptimizationScoreFilterDto } from "../dto/optimization-score-filter.dto";

@Controller({
  path: "optimization-scores",
  version: "1",
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OptimizationScoresController {
  constructor(
    private readonly optimizationScoresService: OptimizationScoresService,
  ) {}

  @Post()
  @Permissions("CREATE_OPTIMIZATION_SCORE")
  create(@Body() dto: CreateOptimizationScoreDto, @CurrentUser() user: any) {
    return this.optimizationScoresService.create(dto, user);
  }

  @Get()
  @Permissions("VIEW_OPTIMIZATION_SCORES")
  findAll(@Query() query: OptimizationScoreFilterDto, @CurrentUser() user: any) {
    return this.optimizationScoresService.findAll(query, user);
  }

  @Patch(":id")
  @Permissions("UPDATE_OPTIMIZATION_SCORE")
  update(@Param("id") id: string, @Body() dto: UpdateOptimizationScoreDto, @CurrentUser() user: any) {
    return this.optimizationScoresService.update(id, dto, user);
  }
}
