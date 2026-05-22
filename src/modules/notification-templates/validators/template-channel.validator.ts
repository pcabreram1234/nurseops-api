import { Injectable } from "@nestjs/common";

@Injectable()
export class TemplateChannelValidator {
    private readonly channels =
        [
            "EMAIL",
            "SMS",
            "PUSH",
            "IN_APP",
            "WHATSAPP",
        ];

    validate(
        channel: string,
    ) {
        return this.channels.includes(
            channel,
        );
    }
}