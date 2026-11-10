import { Controller, Post, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ShiftChangeApprovalsService, UserOrgContext } from '../services/shift-change-approvals.service';
import { ApprovalEngineService } from '../services/approval-engine.service';
import { CreateShiftChangeApprovalDto } from '../dto/create-shift-change-approval.dto';
import { ApproveShiftChangeDto } from '../dto/approve-shift-change.dto';
import { RejectShiftChangeDto } from '../dto/reject-shift-change.dto';
import { ShiftChangeApprovalFilterDto } from '../dto/shift-change-approval-filter.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { PermissionsGuard } from '@modules/auth/guards/permissions.guard';
import { Permissions } from '@modules/auth/decorators/permissions.decorator';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { ApprovalContext } from '../interfaces/approval-context.interface';

@Controller({ path: 'shift-change-approvals', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ShiftChangeApprovalsController {
  constructor(
    private readonly approvalsService: ShiftChangeApprovalsService,
    private readonly engineService: ApprovalEngineService,
  ) { }

  @Post()
  @Roles("SUPER", "SYSTEM_ADMIN", "NIGHT_SUPERVISOR", "SUPERVISOR")
  @Permissions('REQUEST_SHIFT_CHG')
  create(@Body() dto: CreateShiftChangeApprovalDto, @CurrentUser() user: any) {
    const userOrg: UserOrgContext = {
      organizationId: user?.organizationId,
      departmentId: user?.departmentId,
      role: user?.role,
      id: user?.id || user?.sub,
    };
    return this.approvalsService.create(dto, userOrg);
  }

  @Get()
  @Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER", "NIGHT_SUPERVISOR", "SUPERVISOR", "JUNIOR_NURSE", "SENIOR_NURSE")
  @Permissions('VIEW_SHIFT_CHG')
  findAll(@Query() query: ShiftChangeApprovalFilterDto, @CurrentUser() user: any) {
    const userOrg: UserOrgContext = {
      organizationId: user?.organizationId,
      departmentId: user?.departmentId,
      role: user?.role,
      id: user?.id || user?.sub,
    };
    return this.approvalsService.findAll(query, userOrg);
  }

  @Patch(':id/approve')
  @Roles("SUPER", "SYSTEM_ADMIN", "NIGHT_SUPERVISOR", "SUPERVISOR")
  @Permissions('APPROVE_SHIFT_CHG')
  async approve(@Param('id') id: string, @Body() dto: ApproveShiftChangeDto, @CurrentUser() user: any) {
    const userOrg: UserOrgContext = {
      organizationId: user?.organizationId,
      departmentId: user?.departmentId,
      role: user?.role,
      id: user?.id || user?.sub,
    };

    // Validar acceso al approval antes de aprobar
    await this.approvalsService.findOne(id, userOrg);

    const context: ApprovalContext = {
      userId: userOrg!.id!,
      organizationId: userOrg!.organizationId!,
      role: userOrg!.role!,
      permissions: user?.permissions || []
    };
    return this.engineService.processApproval(id, 'APPROVE', context, dto.comment || 'Aprobado sin observaciones adicionales.');
  }

  @Patch(':id/reject')
  @Roles("SUPER", "SYSTEM_ADMIN", "NIGHT_SUPERVISOR", "SUPERVISOR")
  @Permissions('APPROVE_SHIFT_CHG')
  async reject(@Param('id') id: string, @Body() dto: RejectShiftChangeDto, @CurrentUser() user: any) {
    const userOrg: UserOrgContext = {
      organizationId: user?.organizationId,
      departmentId: user?.departmentId,
      role: user?.role,
      id: user?.id || user?.sub,
    };

    // Validar acceso al approval antes de rechazar
    await this.approvalsService.findOne(id, userOrg);

    const context: ApprovalContext = {
      userId: userOrg!.id!,
      organizationId: userOrg!.organizationId!,
      role: userOrg!.role!,
      permissions: user?.permissions || []
    };
    return this.engineService.processApproval(id, 'REJECT', context, dto.reason);
  }
}
