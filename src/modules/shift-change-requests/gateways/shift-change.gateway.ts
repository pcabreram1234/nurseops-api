import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";

import { Server } from "socket.io";

@WebSocketGateway({
  cors: true,
})
export class ShiftChangeGateway {
  @WebSocketServer()
  server!: Server;

  emitApproved(payload: any) {
    this.server.emit("shift-change-approved", payload);
  }
}
