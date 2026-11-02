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

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";
import { Permissions } from "@modules/auth/decorators/permissions.decorator";
import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";

import {
  CreateDocumentTemplateDto,
  UpdateDocumentTemplateDto,
} from "../dto";
import { DocumentTemplatesService } from "../services/document-templates.service";

@Controller({
  path: "document-templates",
  version: "1",
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DocumentTemplatesController {
  constructor(private readonly service: DocumentTemplatesService) {}

  @Get()
  @Permissions("VIEW_DOCUMENT_TEMPLATES")
  findAll(
    @CurrentUser() user: any,
    @Query("documentType") documentType?: string,
    @Query("status") status?: string,
  ) {
    return this.service.findAll(user, { documentType, status });
  }

  @Get(":id")
  @Permissions("VIEW_DOCUMENT_TEMPLATES")
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Post()
  @Permissions("CREATE_DOCUMENT_TEMPLATE")
  create(@Body() dto: CreateDocumentTemplateDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Patch(":id")
  @Permissions("MANAGE_DOCUMENT_TEMPLATES")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateDocumentTemplateDto,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, dto, user);
  }

  @Post(":id/activate")
  @Permissions("MANAGE_DOCUMENT_TEMPLATES")
  activate(@Param("id") id: string, @CurrentUser() user: any) {
    return this.service.activate(id, user);
  }

  @Post(":id/set-default")
  @Permissions("MANAGE_DOCUMENT_TEMPLATES")
  setDefault(@Param("id") id: string, @CurrentUser() user: any) {
    return this.service.setDefault(id, user);
  }

  @Post(":id/archive")
  @Permissions("MANAGE_DOCUMENT_TEMPLATES")
  archive(@Param("id") id: string, @CurrentUser() user: any) {
    return this.service.archive(id, user);
  }
}
