import { Processor } from "@nestjs/bullmq";

@Processor("document-cleanup")
export class DocumentCleanupJob {}
