import { Injectable } from "@nestjs/common";

@Injectable()
export class NotificationCodeValidator {
    validate(
        code: string,
    ) {
        return code.startsWith(
            "NOTIF_",
        );
    }
}