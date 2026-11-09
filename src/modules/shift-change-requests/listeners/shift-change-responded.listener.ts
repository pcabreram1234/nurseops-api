import { OnEvent } from "@nestjs/event-emitter";
import { NotificationsService } from "@modules/notifications/services/notifications.service";
import { PrismaService } from "@infra/database/prisma.service";
import { NotificationChannel } from "@modules/notifications/dto/send-notification.dto";

export class ShiftChangeRespondedListener {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent("shift-change.responded")
  async handle(payload: any) {
    const { requestId, organizationId, decision } = payload;

    try {
      const request = await this.prisma.shiftChangeRequest.findUnique({
        where: { id: requestId },
        select: {
          requesterId: true,
          receiverId: true,
          status: true,
        },
      });

      if (!request) return;

      const notifyUsers = [request.requesterId];
      if (request.receiverId) {
        notifyUsers.push(request.receiverId);
      }

      const title =
        decision === "APPROVED"
          ? "Solicitud de cambio aceptada"
          : "Solicitud de cambio rechazada";
      const message =
        decision === "APPROVED"
          ? "La enfermera ha aceptado tu solicitud de cambio de turno."
          : "La enfermera ha rechazado tu solicitud de cambio de turno.";

      await this.notificationsService.sendBatch(
        notifyUsers,
        organizationId,
        title,
        message,
        [NotificationChannel.IN_APP, NotificationChannel.PUSH],
        { requestId, type: "SHIFT_CHANGE_RESPONDED" },
      );
    } catch (error) {
      console.error("Error in ShiftChangeRespondedListener:", error);
    }
  }
}
