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

import { WorkloadMetricsService } from "@modules/workload-metrics/services/workload-metrics.service";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { CreateWorkloadMetricDto } from "../dto/create-workload-metric.dto";
import { UpdateWorkloadMetricDto } from "../dto/update-workload-metric.dto";
import { WorkloadMetricFilterDto } from "../dto/workload-metric-filter.dto";

@Controller({
  path: "workload-metrics",
  version: "1",
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WorkloadMetricsController {
  constructor(
    private readonly workloadMetricsService: WorkloadMetricsService,
  ) {}

  @Post()
  @Permissions("CREATE_WORKLOAD_METRICS")
  create(@Body() dto: CreateWorkloadMetricDto, @CurrentUser() user: any) {
    return this.workloadMetricsService.create(dto, user);
  }

  @Get()
  @Permissions("VIEW_WORKLOAD_METRICS")
  findAll(@Query() query: WorkloadMetricFilterDto, @CurrentUser() user: any) {
    return this.workloadMetricsService.findAll(query, user);
  }

  @Patch(":id")
  @Permissions("UPDATE_WORKLOAD_METRICS")
  update(@Param("id") id: string, @Body() dto: UpdateWorkloadMetricDto, @CurrentUser() user: any) {
    return this.workloadMetricsService.update(id, dto, user);
  }
}
