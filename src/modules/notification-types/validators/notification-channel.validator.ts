import { Injectable } from "@nestjs/common";

@Injectable()
export class NotificationChannelValidator {
    private readonly allowedChannels =
        [
            "EMAIL",
            "PUSH",
            "SMS",
            "IN_APP",
            "WHATSAPP",
        ];

    validate(
        channels: string[],
    ) {
        return channels.every(
            (
                channel,
            ) =>
                this.allowedChannels.includes(
                    channel,
                ),
        );
    }
}