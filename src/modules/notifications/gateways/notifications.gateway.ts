import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";

import { Server } from "socket.io";

@WebSocketGateway({
  cors: true,
})
export class NotificationsGateway {
  @WebSocketServer()
  server!: Server;

  emitNotification(payload: any) {
    this.server.emit("notification.received", payload);
  }
}
