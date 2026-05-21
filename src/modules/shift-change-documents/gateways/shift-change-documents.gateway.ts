import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";

import { Server } from "socket.io";

@WebSocketGateway({
  cors: true,
})
export class ShiftChangeDocumentsGateway {
  @WebSocketServer()
  server!: Server;

  emitUploaded(payload: any) {
    this.server.emit("document-uploaded", payload);
  }
}
