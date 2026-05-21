import { OnEvent } from "@nestjs/event-emitter";

export class DocumentUploadedListener {
  @OnEvent("document.uploaded")
  handle(payload: any) {
    console.log("Document uploaded", payload);
  }
}
