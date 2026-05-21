import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { ShiftChangeDocumentsController } from "@modules/shift-change-documents/controllers/shift-change-documents.controller";

import { ShiftChangeDocumentsService } from "./services/shift-change-documents.service";

import { DocumentStorageService } from "./services/document-storage.service";

import { DocumentValidatorService } from "./services/document-validator.service";

import { DocumentAuditService } from "./services/document-audit.service";

import { DocumentVirusScanService } from "./services/document-virus-scan.service";

import { ShiftChangeDocumentsGateway } from "./gateways/shift-change-documents.gateway";

@Module({
  imports: [PrismaModule],

  controllers: [ShiftChangeDocumentsController],

  providers: [
    ShiftChangeDocumentsService,

    DocumentStorageService,

    DocumentValidatorService,

    DocumentAuditService,

    DocumentVirusScanService,

    ShiftChangeDocumentsGateway,
  ],

  exports: [ShiftChangeDocumentsService],
})
export class ShiftChangeDocumentsModule {}
