import { Processor } from "@nestjs/bullmq";

@Processor("document-ocr")
export class DocumentOCRJob {}
