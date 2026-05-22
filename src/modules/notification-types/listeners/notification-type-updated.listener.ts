import { OnEvent } from "@nestjs/event-emitter";

export class NotificationTypeUpdatedListener {
    @OnEvent(
        "notification-type.updated",
    )
    handle(
        payload: any,
    ) {
        console.log(
            "Notification type updated",
            payload,
        );
    }
}