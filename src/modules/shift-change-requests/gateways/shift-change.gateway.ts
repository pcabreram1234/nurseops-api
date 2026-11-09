import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";

import { Server } from "socket.io";

@WebSocketGateway({
  cors: true,
})
export class ShiftChangeGateway {
  @WebSocketServer()
  server!: Server;

  emitApproved(payload: any) {
    this.server.emit("shift-change.approved", payload);
  }

  emitCreated(payload: any) {
    this.server.emit("shift-change.created", payload);
  }

  emitResponded(payload: any) {
    this.server.emit("shift-change.responded", payload);
  }

  emitCancelled(payload: any) {
    this.server.emit("shift-change.cancelled", payload);
  }
}
