import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard'; // Ajusta a tu guardián de WS si cuentas con uno

@UseGuards(JwtAuthGuard)
@WebSocketGateway({ cors: { origin: '*' }, namespace: 'approvals' })
export class ShiftChangeApprovalsGateway {
  @WebSocketServer() server!: Server;

  @SubscribeMessage('join_organization')
  handleJoinOrganization(@MessageBody('organizationId') orgId: string, @ConnectedSocket() client: Socket) {
    client.join(`org_${orgId}`);
    return { status: 'JOINED', room: `org_${orgId}` };
  }
}


