import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";

import { Server } from "socket.io";

@WebSocketGateway({
  cors: true,
})
export class EmergencyCoveragesGateway {
  @WebSocketServer()
  server!: Server;

  emitCoverageCreated(payload: any) {
    this.server.emit("emergency-created", payload);
  }

  emitCoverageAssigned(payload: any) {
    this.server.emit("emergency-assigned", payload);
  }
}
