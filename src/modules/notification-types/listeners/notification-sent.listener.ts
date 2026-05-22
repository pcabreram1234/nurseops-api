import { OnEvent } from "@nestjs/event-emitter";

export class NotificationSentListener {
    @OnEvent(
        "notification.sent",
    )
    handle(
        payload: any,
    ) {
        console.log(
            "Notification sent",
            payload,
        );
    }
}