-- CreateEnum
CREATE TYPE "DocumentTemplateStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DocumentTemplateFormat" AS ENUM ('PDF', 'DOCX');

-- CreateEnum
CREATE TYPE "GeneratedDocumentStatus" AS ENUM ('GENERATED', 'SUBSTITUTED', 'VOID');

-- CreateEnum
CREATE TYPE "DocumentActionType" AS ENUM ('GENERATED', 'VIEWED', 'DOWNLOADED', 'SUBSTITUTED', 'VOIDED');

-- AlterEnum
ALTER TYPE "OperationalAlertyTypes" ADD VALUE 'MISSING_SPECIALIST';

-- AlterTable
ALTER TABLE "department_configurations" ADD COLUMN     "maxSimultaneousNurses" INTEGER;

-- CreateTable
CREATE TABLE "document_templates" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "branchId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "documentType" TEXT NOT NULL,
    "format" "DocumentTemplateFormat" NOT NULL DEFAULT 'PDF',
    "header" JSONB,
    "body" TEXT NOT NULL,
    "footer" JSONB,
    "logoPath" TEXT,
    "fields" JSONB,
    "numberingPrefix" TEXT,
    "numberingDigits" INTEGER,
    "nextSequence" INTEGER NOT NULL DEFAULT 1,
    "signatureBlocks" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "status" "DocumentTemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "supersedesTemplateId" TEXT,
    "retentionDays" INTEGER,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_documents" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "branchId" TEXT,
    "templateId" TEXT NOT NULL,
    "templateVersion" INTEGER NOT NULL,
    "documentType" TEXT NOT NULL,
    "documentNumber" TEXT,
    "title" TEXT NOT NULL,
    "status" "GeneratedDocumentStatus" NOT NULL DEFAULT 'GENERATED',
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'application/pdf',
    "sizeBytes" INTEGER,
    "employeeId" TEXT,
    "vacationId" TEXT,
    "metadata" JSONB,
    "generatedById" TEXT,
    "retentionUntil" TIMESTAMP(3),
    "substitutedById" TEXT,
    "voidReason" TEXT,
    "voidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generated_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_actions" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "action" "DocumentActionType" NOT NULL,
    "userId" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "document_templates_supersedesTemplateId_key" ON "document_templates"("supersedesTemplateId");

-- CreateIndex
CREATE INDEX "document_templates_organizationId_documentType_status_idx" ON "document_templates"("organizationId", "documentType", "status");

-- CreateIndex
CREATE UNIQUE INDEX "document_templates_organizationId_code_version_key" ON "document_templates"("organizationId", "code", "version");

-- CreateIndex
CREATE UNIQUE INDEX "generated_documents_substitutedById_key" ON "generated_documents"("substitutedById");

-- CreateIndex
CREATE INDEX "generated_documents_organizationId_documentType_status_idx" ON "generated_documents"("organizationId", "documentType", "status");

-- CreateIndex
CREATE INDEX "generated_documents_employeeId_idx" ON "generated_documents"("employeeId");

-- CreateIndex
CREATE INDEX "generated_documents_vacationId_idx" ON "generated_documents"("vacationId");

-- CreateIndex
CREATE INDEX "document_actions_documentId_createdAt_idx" ON "document_actions"("documentId", "createdAt");

-- AddForeignKey
ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_supersedesTemplateId_fkey" FOREIGN KEY ("supersedesTemplateId") REFERENCES "document_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "document_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "nurses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_vacationId_fkey" FOREIGN KEY ("vacationId") REFERENCES "vacations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_substitutedById_fkey" FOREIGN KEY ("substitutedById") REFERENCES "generated_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_actions" ADD CONSTRAINT "document_actions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "generated_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

