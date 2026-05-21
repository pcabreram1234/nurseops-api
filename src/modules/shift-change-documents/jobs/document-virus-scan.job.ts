import { Processor } from "@nestjs/bullmq";

@Processor("document-virus-scan")
export class DocumentVirusScanJob {}
