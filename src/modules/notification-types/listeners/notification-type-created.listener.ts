import { OnEvent } from "@nestjs/event-emitter";

export class NotificationTypeCreatedListener {
    @OnEvent(
        "notification-type.created",
    )
    handle(
        payload: any,
    ) {
        console.log(
            "Notification type created",
            payload,
        );
    }
}