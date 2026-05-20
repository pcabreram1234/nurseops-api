import { Logger } from "@nestjs/common";

import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";

import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class SchedulesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(SchedulesGateway.name);

  @WebSocketServer()
  server!: Server;

  /*
  |--------------------------------------------------------------------------
  | CONNECTION
  |--------------------------------------------------------------------------
  */

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  /*
  |--------------------------------------------------------------------------
  | DISCONNECT
  |--------------------------------------------------------------------------
  */

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /*
  |--------------------------------------------------------------------------
  | JOIN ORGANIZATION ROOM
  |--------------------------------------------------------------------------
  */

  @SubscribeMessage("schedule.join.organization")
  handleJoinOrganization(
    @ConnectedSocket()
    client: Socket,

    @MessageBody()
    payload: {
      organizationId: string;
    },
  ) {
    client.join(`organization:${payload.organizationId}`);

    return {
      joined: true,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | EMIT SCHEDULE PUBLISHED
  |--------------------------------------------------------------------------
  */

  emitSchedulePublished(payload: any) {
    this.server
      .to(`organization:${payload.organizationId}`)
      .emit("schedule.published", payload);
  }

  /*
  |--------------------------------------------------------------------------
  | EMIT SCHEDULE UPDATED
  |--------------------------------------------------------------------------
  */

  emitScheduleUpdated(payload: any) {
    this.server
      .to(`organization:${payload.organizationId}`)
      .emit("schedule.updated", payload);
  }

  /*
  |--------------------------------------------------------------------------
  | EMIT SCHEDULE GENERATED
  |--------------------------------------------------------------------------
  */

  emitScheduleGenerated(payload: any) {
    this.server
      .to(`organization:${payload.organizationId}`)
      .emit("schedule.generated", payload);
  }

  /*
  |--------------------------------------------------------------------------
  | EMIT VALIDATION RESULT
  |--------------------------------------------------------------------------
  */

  emitScheduleValidation(payload: any) {
    this.server
      .to(`organization:${payload.organizationId}`)
      .emit("schedule.validation.completed", payload);
  }
}
