import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@modules/auth/guards/permissions.guard';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { DashboardService } from '../services/dashboard.service';
import { DashboardFilterDto } from '../dto/dashboard-filter.dto';

@Controller({ path: 'dashboard', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@CurrentUser() user: any, @Query() filters: DashboardFilterDto) {
    return this.dashboardService.getSummary(user, filters);
  }
}
