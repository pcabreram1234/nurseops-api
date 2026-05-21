import { Controller, Post, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ShiftChangeApprovalsService } from '../services/shift-change-approvals.service';
import { ApprovalEngineService } from '../services/approval-engine.service';
import { CreateShiftChangeApprovalDto } from '../dto/create-shift-change-approval.dto';
import { ApproveShiftChangeDto } from '../dto/approve-shift-change.dto';
import { RejectShiftChangeDto } from '../dto/reject-shift-change.dto';
import { ShiftChangeApprovalFilterDto } from '../dto/shift-change-approval-filter.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
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
  ) {}

  @Post()
  @Permissions('REQUEST_SHIFT_CHG')
  create(@Body() dto: CreateShiftChangeApprovalDto, @CurrentUser() user: any) {
    return this.approvalsService.create(dto, user);
  }

  @Get()
  @Permissions('VIEW_SHIFT_CHG')
  findAll(@Query() query: ShiftChangeApprovalFilterDto, @CurrentUser() user: any) {
    return this.approvalsService.findAll(query, user);
  }

  @Patch(':id/approve')
  @Permissions('APPROVE_SHIFT_CHG')
  approve(@Param('id') id: string, @Body() dto: ApproveShiftChangeDto, @CurrentUser() user: any) {
    const context: ApprovalContext = { userId: user.id, organizationId: user.organizationId, role: user.role, permissions: user.permissions };
    return this.engineService.processApproval(id, 'APPROVE', context, dto.comment || 'Aprobado sin observaciones adicionales.');
  }

  @Patch(':id/reject')
  @Permissions('APPROVE_SHIFT_CHG')
  reject(@Param('id') id: string, @Body() dto: RejectShiftChangeDto, @CurrentUser() user: any) {
    const context: ApprovalContext = { userId: user.id, organizationId: user.organizationId, role: user.role, permissions: user.permissions };
    return this.engineService.processApproval(id, 'REJECT', context, dto.reason);
  }
}