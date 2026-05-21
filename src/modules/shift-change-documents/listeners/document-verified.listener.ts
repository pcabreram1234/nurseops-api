import { OnEvent } from "@nestjs/event-emitter";

export class DocumentVerifiedListener {
  @OnEvent("document.verified")
  handle(payload: any) {
    console.log("Document verified", payload);
  }
}
