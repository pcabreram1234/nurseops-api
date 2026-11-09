import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Delete,
} from "@nestjs/common";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@modules/auth/guards/roles.guards";
import { Roles } from "@modules/auth/decorators/roles.decorator";
import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";
import { ShiftChangeRequestsService } from "@modules/shift-change-requests/services/shift-change-requests.service";
import { CreateShiftChangeRequestDto } from "@modules/shift-change-requests/dto/create-shift-change-request.dto";
import { UpdateShiftChangeRequestDto } from "@modules/shift-change-requests/dto/update-shift-change-request.dto";
import { ApproveShiftChangeDto } from "@modules/shift-change-requests/dto/approve-shift-change.dto";
import { RejectShiftChangeDto } from "@modules/shift-change-requests/dto/reject-shift-change.dto";
import { CancelShiftChangeDto } from "@modules/shift-change-requests/dto/cancel-shift-change.dto";
import { ShiftChangeFilterDto } from "@modules/shift-change-requests/dto/shift-change-filter.dto";
import { RespondShiftChangeDto } from "@modules/shift-change-requests/dto/respond-shift-change.dto";
import { ApplyShiftChangeDto } from "@modules/shift-change-requests/dto/apply-shift-change.dto";
import { ApplyToCoverageDto } from "@modules/shift-change-requests/dto/apply-to-coverage.dto";
import { SelectCandidateDto } from "@modules/shift-change-requests/dto/select-candidate.dto";
import { WithdrawApplicationDto } from "@modules/shift-change-requests/dto/withdraw-application.dto";
import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";
import { Permissions } from "@modules/auth/decorators/permissions.decorator";
import { PERMISSIONS } from "@modules/permissions/constants/permissions.constants";

@Controller({
  path: "shift-change-requests",
  version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class ShiftChangeRequestsController {
  constructor(private readonly service: ShiftChangeRequestsService) {}

  @Post()
  @Roles("SUPER", "ADMIN", "NURSE", "SUPERVISOR")
  @Permissions(PERMISSIONS.SHIFT_CHANGE.CREATE_REQUEST)
  create(@Body() dto: CreateShiftChangeRequestDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Get()
  @Roles("SUPER", "ADMIN", "SUPERVISOR", "NURSE")
  @Permissions(PERMISSIONS.SHIFT_CHANGE.READ_REQUEST)
  findAll(@Query() query: ShiftChangeFilterDto, @CurrentUser() user: any) {
    return this.service.findMyRequests(query, user);
  }

  @Get("received")
  @Roles("SUPER", "ADMIN", "SUPERVISOR", "NURSE")
  @Permissions(PERMISSIONS.SHIFT_CHANGE.READ_RECEIVED)
  findReceived(@Query() query: ShiftChangeFilterDto, @CurrentUser() user: any) {
    return this.service.findReceivedRequests(query, user);
  }

  @Get("opportunities")
  @Roles("SUPER", "ADMIN", "SUPERVISOR", "NURSE")
  @Permissions(PERMISSIONS.SHIFT_CHANGE.READ_OPPORTUNITIES)
  findOpportunities(@Query() query: ShiftChangeFilterDto, @CurrentUser() user: any) {
    return this.service.findCoverageOpportunities(query, user);
  }

  @Get("stats")
  @Roles("SUPER", "ADMIN", "SUPERVISOR", "NURSE")
  @Permissions(PERMISSIONS.SHIFT_CHANGE.READ_STATS)
  getStats(@CurrentUser() user: any) {
    return this.service.getStats(user);
  }

  @Get(":id")
  @Roles("SUPER", "ADMIN", "SUPERVISOR", "NURSE")
  @Permissions(PERMISSIONS.SHIFT_CHANGE.READ_DETAIL)
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Patch(":id")
  @Roles("SUPER", "ADMIN")
  @Permissions(PERMISSIONS.SHIFT_CHANGE.UPDATE_REQUEST)
  update(
    @Param("id") id: string,
    @Body() dto: UpdateShiftChangeRequestDto,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, dto, user);
  }

  @Post(":id/respond")
  @Roles("SUPER", "ADMIN", "SUPERVISOR", "NURSE")
  @Permissions(PERMISSIONS.SHIFT_CHANGE.RESPOND_REQUEST)
  respond(
    @Param("id") id: string,
    @Body() dto: RespondShiftChangeDto,
    @CurrentUser() user: any,
  ) {
    return this.service.respond(id, user.sub, dto.decision, dto.comments);
  }

  @Post(":id/apply")
  @Roles("SUPER", "ADMIN", "SUPERVISOR")
  @Permissions(PERMISSIONS.SHIFT_CHANGE.APPLY_REQUEST)
  apply(
    @Param("id") id: string,
    @Body() dto: ApplyShiftChangeDto,
    @CurrentUser() user: any,
  ) {
    return this.service.apply(id, user.sub, user.organizationId);
  }

  @Patch(":id/approve")
  @Roles("SUPER", "ADMIN", "SUPERVISOR")
  @Permissions(PERMISSIONS.SHIFT_CHANGE.APPROVE_REQUEST)
  approve(
    @Param("id") id: string,
    @Body() dto: ApproveShiftChangeDto,
    @CurrentUser() user: any,
  ) {
    return this.service.approve(id, user?.id || user?.sub, dto, user);
  }

  @Patch(":id/reject")
  @Roles("SUPER", "ADMIN", "SUPERVISOR")
  @Permissions(PERMISSIONS.SHIFT_CHANGE.REJECT_REQUEST)
  reject(
    @Param("id") id: string,
    @Body() dto: RejectShiftChangeDto,
    @CurrentUser() user: any,
  ) {
    return this.service.reject(id, user?.id || user?.sub, dto, user);
  }

  @Patch(":id/cancel")
  @Roles("SUPER", "ADMIN", "SUPERVISOR", "NURSE")
  @Permissions(PERMISSIONS.SHIFT_CHANGE.CANCEL_REQUEST)
  cancel(
    @Param("id") id: string,
    @Body() dto: CancelShiftChangeDto,
    @CurrentUser() user: any,
  ) {
    return this.service.cancel(id, user);
  }

  @Post("coverage/:requestId/apply")
  @Roles("SUPER", "ADMIN", "SUPERVISOR", "NURSE")
  @Permissions(PERMISSIONS.SHIFT_CHANGE.APPLY_COVERAGE)
  applyToCoverage(
    @Param("requestId") requestId: string,
    @Body() dto: ApplyToCoverageDto,
    @CurrentUser() user: any,
  ) {
    return this.service.applyToCoverage(requestId, user.sub);
  }

  @Post("coverage/:requestId/select")
  @Roles("SUPER", "ADMIN", "SUPERVISOR", "NURSE")
  @Permissions(PERMISSIONS.SHIFT_CHANGE.SELECT_CANDIDATE)
  selectCandidate(
    @Param("requestId") requestId: string,
    @Body() dto: SelectCandidateDto,
    @CurrentUser() user: any,
  ) {
    return this.service.selectCandidate(
      requestId,
      dto.candidateNurseId,
      user.sub,
      user.role,
      user.organizationId,
    );
  }

  @Delete("coverage/applications/:applicationId")
  @Roles("SUPER", "ADMIN", "SUPERVISOR", "NURSE")
  @Permissions(PERMISSIONS.SHIFT_CHANGE.WITHDRAW_APPLICATION)
  withdrawApplication(
    @Param("applicationId") dto: WithdrawApplicationDto,
    @CurrentUser() user: any,
  ) {
    return this.service.withdrawApplication(dto.applicationId, user.sub);
  }
}