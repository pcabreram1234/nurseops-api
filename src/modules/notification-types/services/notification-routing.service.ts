import { Injectable } from "@nestjs/common";

@Injectable()
export class NotificationRoutingService {
    resolveChannels(
        payload: any,
    ) {
        /*
        |--------------------------------------------------------------------------
        | FUTURE SMART ROUTING
        |--------------------------------------------------------------------------
        */

        const channels: string[] =
            [];

        if (
            payload.allowPush
        ) {
            channels.push(
                "PUSH",
            );
        }

        if (
            payload.allowEmail
        ) {
            channels.push(
                "EMAIL",
            );
        }

        if (
            payload.allowSMS
        ) {
            channels.push(
                "SMS",
            );
        }

        return channels;
    }
}