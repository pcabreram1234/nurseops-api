import { Injectable } from "@nestjs/common";

@Injectable()
export class NotificationTemplateValidator {
    validate(
        template: any,
    ) {
        return true;
    }
}