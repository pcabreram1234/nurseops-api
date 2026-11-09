import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guards';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { PermissionsGuard } from '@modules/auth/guards/permissions.guard';
import { Permissions } from '@modules/auth/decorators/permissions.decorator';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { DashboardService } from '../services/dashboard.service';
import { DashboardFilterDto } from '../dto/dashboard-filter.dto';
import { PERMISSIONS } from '@modules/permissions/constants/permissions.constants';

@Controller({ path: 'dashboard', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @Permissions(PERMISSIONS.DASHBOARD.READ)
  getSummary(@CurrentUser() user: any, @Query() filters: DashboardFilterDto) {
    return this.dashboardService.getSummary(user, filters);
  }
}
