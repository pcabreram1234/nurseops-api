import { OnEvent } from "@nestjs/event-emitter";

export class DocumentExpiredListener {
  @OnEvent("document.expired")
  handle(payload: any) {
    console.log("Document expired", payload);
  }
}
