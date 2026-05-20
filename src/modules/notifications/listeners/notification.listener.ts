import { Injectable } from "@nestjs/common";

import { OnEvent } from "@nestjs/event-emitter";

import { NotificationsGateway } from "../gateways/notifications.gateway";

@Injectable()
export class NotificationListener {
  constructor(private readonly gateway: NotificationsGateway) {}

  @OnEvent("notification.sent")
  async handleNotificationSent(payload: any) {
    this.gateway.emitNotification(payload);
  }
}
