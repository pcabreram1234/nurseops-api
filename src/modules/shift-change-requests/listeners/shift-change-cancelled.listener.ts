import { OnEvent } from "@nestjs/event-emitter";
import { NotificationsService } from "@modules/notifications/services/notifications.service";
import { PrismaService } from "@infra/database/prisma.service";
import { NotificationChannel } from "@modules/notifications/dto/send-notification.dto";

export class ShiftChangeCancelledListener {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent("shift-change.cancelled")
  async handle(payload: any) {
    const { requestId, organizationId } = payload;

    try {
      const request = await this.prisma.shiftChangeRequest.findUnique({
        where: { id: requestId },
        select: {
          requesterId: true,
          receiverId: true,
        },
      });

      if (!request) return;

      const notifyUsers = [request.requesterId];
      if (request.receiverId) {
        notifyUsers.push(request.receiverId);
      }

      await this.notificationsService.sendBatch(
        notifyUsers,
        organizationId,
        "Solicitud de cambio cancelada",
        "Una solicitud de cambio de turno ha sido cancelada.",
        [NotificationChannel.IN_APP, NotificationChannel.PUSH],
        { requestId, type: "SHIFT_CHANGE_CANCELLED" },
      );
    } catch (error) {
      console.error("Error in ShiftChangeCancelledListener:", error);
    }
  }
}
