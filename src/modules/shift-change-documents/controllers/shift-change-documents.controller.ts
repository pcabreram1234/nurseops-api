import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";

import { FileInterceptor } from "@nestjs/platform-express";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

import { RolesGuard } from "@modules/auth/guards/roles.guards";

import { Roles } from "@modules/auth/decorators/roles.decorator";

import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { ShiftChangeDocumentsService, UserOrgContext } from "../services/shift-change-documents.service";

import { CreateShiftChangeDocumentDto } from "@modules/shift-change-documents/dto/create-shift-change-document.dto";

import { UpdateShiftChangeDocumentDto } from "@modules/shift-change-documents/dto/update-shift-change-document.dto";

import { VerifyShiftChangeDocumentDto } from "@modules/shift-change-documents/dto/verify-shift-change-document.dto";

import { UploadShiftChangeDocumentDto } from "@modules/shift-change-documents/dto/upload-shift-change-document.dto";

import { ShiftChangeDocumentFilterDto } from "@modules/shift-change-documents/dto/shift-change-document-filter.dto";
import { Permissions } from "@modules/auth/decorators/permissions.decorator";

@Controller({
    path: "shift-change-documents",
    version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShiftChangeDocumentsController {
    constructor(private readonly service: ShiftChangeDocumentsService) { }

    @Post()
    @Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER", "NIGHT_SUPERVISOR", "SUPERVISOR")
    @Permissions("CREATE_SHIFT_CHANGE_DOCUMENT")
    create(@Body() dto: CreateShiftChangeDocumentDto, @CurrentUser() user: any) {
        const userOrg: UserOrgContext = {
            organizationId: user?.organizationId,
            departmentId: user?.departmentId,
            role: user?.role,
            id: user?.id || user?.sub,
        };
        return this.service.create(dto, userOrg);
    }

    @Post("upload")
    @Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER", "NIGHT_SUPERVISOR", "SUPERVISOR", "JUNIOR_NURSE", "SENIOR_NURSE")
    @Permissions("UPLOAD_DOCUMENTS")
    @UseInterceptors(FileInterceptor("file"))
    upload(@UploadedFile() file: any, @Body() dto: UploadShiftChangeDocumentDto, @CurrentUser() user: any) {
        const userOrg: UserOrgContext = {
            organizationId: user?.organizationId,
            departmentId: user?.departmentId,
            role: user?.role,
            id: user?.id || user?.sub,
        };
        return this.service.upload(file, dto, userOrg);
    }

    @Get()
    @Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER", "NIGHT_SUPERVISOR", "SUPERVISOR", "JUNIOR_NURSE", "SENIOR_NURSE")
    @Permissions("VIEW_ALL_SHIFT_CHANGE_DOCUMENT")
    findAll(@Query() filters: ShiftChangeDocumentFilterDto, @CurrentUser() user: any) {
        const userOrg: UserOrgContext = {
            organizationId: user?.organizationId,
            departmentId: user?.departmentId,
            role: user?.role,
            id: user?.id || user?.sub,
        };
        return this.service.findAll(filters, userOrg);
    }

    @Get(":id")
    @Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER", "NIGHT_SUPERVISOR", "SUPERVISOR", "JUNIOR_NURSE", "SENIOR_NURSE")
    @Permissions("VIEW_SHIFT_CHANGE_DOCUMENT")
    findOne(@Param("id") id: string, @CurrentUser() user: any) {
        const userOrg: UserOrgContext = {
            organizationId: user?.organizationId,
            departmentId: user?.departmentId,
            role: user?.role,
            id: user?.id || user?.sub,
        };
        return this.service.findOne(id, userOrg);
    }

    @Patch(":id")
    @Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER", "NIGHT_SUPERVISOR", "SUPERVISOR")
    @Permissions("UPDATE_SHIFT_CHANGE_DOCUMENT")
    update(@Param("id") id: string, @Body() dto: UpdateShiftChangeDocumentDto, @CurrentUser() user: any) {
        const userOrg: UserOrgContext = {
            organizationId: user?.organizationId,
            departmentId: user?.departmentId,
            role: user?.role,
            id: user?.id || user?.sub,
        };
        return this.service.update(id, dto, userOrg);
    }

    @Patch(":id/verify")
    @Roles("SUPER", "SYSTEM_ADMIN", "HR_MANAGER", "NIGHT_SUPERVISOR", "SUPERVISOR")
    @Permissions("VERIFY_SHIFT_CHANGE_DOCUMENT")
    verify(@Param("id") id: string, @Body() dto: VerifyShiftChangeDocumentDto, @CurrentUser() user: any) {
        const userOrg: UserOrgContext = {
            organizationId: user?.organizationId,
            departmentId: user?.departmentId,
            role: user?.role,
            id: user?.id || user?.sub,
        };
        return this.service.verify(id, dto, userOrg);
    }

    @Delete(":id")
    @Roles("SUPER", "SYSTEM_ADMIN")
    @Permissions("DELETE_SHIFT_CHANGE_DOCUMENT")
    remove(@Param("id") id: string, @CurrentUser() user: any) {
        const userOrg: UserOrgContext = {
            organizationId: user?.organizationId,
            departmentId: user?.departmentId,
            role: user?.role,
            id: user?.id || user?.sub,
        };
        return this.service.softDelete(id, userOrg);
    }
}
