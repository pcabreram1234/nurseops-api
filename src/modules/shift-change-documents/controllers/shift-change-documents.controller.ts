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

import { ShiftChangeDocumentsService } from "../services/shift-change-documents.service";

import { CreateShiftChangeDocumentDto } from "@modules/shift-change-documents/dto/create-shift-change-document.dto";

import { UpdateShiftChangeDocumentDto } from "@modules/shift-change-documents/dto/update-shift-change-document.dto";

import { VerifyShiftChangeDocumentDto } from "@modules/shift-change-documents/dto/verify-shift-change-document.dto";

import { UploadShiftChangeDocumentDto } from "@modules/shift-change-documents/dto/upload-shift-change-document.dto";

import { ShiftChangeDocumentFilterDto } from "@modules/shift-change-documents/dto/shift-change-document-filter.dto";

@Controller({
    path: "shift-change-documents",
    version: "1",
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShiftChangeDocumentsController {
    constructor(private readonly service: ShiftChangeDocumentsService) { }

    @Post()
    @Roles("ADMIN", "SUPERVISOR", "NURSE")
    create(@Body() dto: CreateShiftChangeDocumentDto) {
        return this.service.create(dto);
    }

    @Post("upload")
    @Roles("ADMIN", "SUPERVISOR", "NURSE")
    @UseInterceptors(FileInterceptor("file"))
    upload(@UploadedFile() file: any, @Body() dto: UploadShiftChangeDocumentDto, @CurrentUser() user: any,
    ) {
        return this.service.upload(file, dto, user);
    }

    @Get()
    findAll(@Query() filters: ShiftChangeDocumentFilterDto, @CurrentUser() user: any,) {
        return this.service.findAll(user);
    }

    @Get(":id")
    findOne(@Param("id") id: string, @CurrentUser() user: any,) {
        return this.service.findOne(id, user);
    }

    @Patch(":id")
    update(@Param("id") id: string, @Body() dto: UpdateShiftChangeDocumentDto,) {
        return this.service.update(id, dto);
    }

    @Patch(":id/verify")
    verify(@Param("id") id: string, @Body() dto: VerifyShiftChangeDocumentDto, @CurrentUser() user: any,) {
        return this.service.verify(id, dto, user);
    }

    @Delete(":id")
    remove(@Param("id") id: string,) {
        return this.service.softDelete(id);
    }
}
