import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";
import { Permissions } from "@modules/auth/decorators/permissions.decorator";
import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import { GenerateDocumentDto } from "../dto/generate-document.dto";
import { DocumentFilterDto } from "../dto/document-filter.dto";
import { VoidDocumentDto } from "../dto/void-document.dto";
import { DocumentsService } from "../services/documents.service";

@Controller({
  path: "documents",
  version: "1",
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Get()
  @Permissions("VIEW_DOCUMENTS")
  findAll(@Query() query: DocumentFilterDto, @CurrentUser() user: any) {
    return this.service.findAll(query, user);
  }

  @Get(":id")
  @Permissions("VIEW_DOCUMENTS")
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Get(":id/download")
  @Permissions("DOWNLOAD_DOCUMENT")
  async download(
    @Param("id") id: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const file = await this.service.download(id, user);
    res.set({
      "Content-Type": file.mimeType,
      "Content-Disposition": `attachment; filename="${file.fileName}"`,
      "Content-Length": file.buffer.length,
    });
    res.end(file.buffer);
  }

  @Get(":id/actions")
  @Permissions("VIEW_DOCUMENTS")
  getActions(@Param("id") id: string, @CurrentUser() user: any) {
    return this.service.getActions(id, user);
  }

  @Post("generate")
  @Permissions("GENERATE_DOCUMENT")
  generate(@Body() dto: GenerateDocumentDto, @CurrentUser() user: any) {
    return this.service.generate(dto, user);
  }

  @Post(":id/substitute")
  @Permissions("GENERATE_DOCUMENT")
  substitute(
    @Param("id") id: string,
    @Body() dto: GenerateDocumentDto,
    @CurrentUser() user: any,
  ) {
    return this.service.substitute(id, dto, user);
  }

  @Post(":id/void")
  @Permissions("VOID_DOCUMENT")
  void(
    @Param("id") id: string,
    @Body() dto: VoidDocumentDto,
    @CurrentUser() user: any,
  ) {
    return this.service.void(id, dto, user);
  }
}
