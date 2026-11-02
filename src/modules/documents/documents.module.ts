import { Module } from "@nestjs/common";

import { ScheduleModule } from "@nestjs/schedule";

import { PrismaModule } from "@infra/database/prisma.module";

import { DocumentTemplatesService } from "./services/document-templates.service";
import { DocumentsService } from "./services/documents.service";
import { DocumentStorageService } from "./services/document-storage.service";
import { DocumentGeneratorService } from "./services/document-generator.service";

import { DocumentTemplatesController } from "./controllers/document-templates.controller";
import { DocumentsController } from "./controllers/documents.controller";

import { DocumentRetentionJob } from "./jobs/document-retention.job";

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  controllers: [DocumentTemplatesController, DocumentsController],
  providers: [
    DocumentTemplatesService,
    DocumentsService,
    DocumentStorageService,
    DocumentGeneratorService,
    DocumentRetentionJob,
  ],
  exports: [DocumentsService, DocumentTemplatesService],
})
export class DocumentsModule {}
