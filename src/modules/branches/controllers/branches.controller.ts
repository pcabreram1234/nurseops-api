import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";

import { BranchesService } from "../services/branches.service";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

import { Permissions } from "@modules/auth/decorators/permissions.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { CreateBranchDto } from "../dto/create-branch.dto";
import { UpdateBranchDto } from "../dto/update-branch.dto";
import { BranchFilterDto } from "../dto/branch-filter.dto";

@Controller({
  path: "branches",
  version: "1",
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @Permissions("CREATE_BRANCH")
  create(@Body() dto: CreateBranchDto) {
    return this.branchesService.create(dto);
  }

  @Get()
  @Permissions("VIEW_BRANCHES")
  findAll(@Query() query: BranchFilterDto, @CurrentUser() user: any) {
    return this.branchesService.findAll(query, user);
  }

  @Get(":id")
  @Permissions("VIEW_BRANCH")
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.branchesService.findOne(id, user);
  }

  @Patch(":id")
  @Permissions("UPDATE_BRANCH")
  update(@Param("id") id: string, @Body() dto: UpdateBranchDto, @CurrentUser() user: any) {
    return this.branchesService.update(id, dto, user);
  }

  @Delete(":id")
  @Permissions("DELETE_BRANCH")
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.branchesService.remove(id, user);
  }
}
