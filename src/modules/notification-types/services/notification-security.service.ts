import { Injectable } from "@nestjs/common";

@Injectable()
export class NotificationSecurityService {
    validate(
        payload: any,
    ) {
        /*
        |--------------------------------------------------------------------------
        | FUTURE SECURITY RULES
        |--------------------------------------------------------------------------
        */

        return {
            allowed: true,
        };
    }

    sanitize(
        content: string,
    ) {
        return content
            .replace(
                /<script.*?>.*?<\/script>/gi,
                "",
            )
            .trim();
    }
}