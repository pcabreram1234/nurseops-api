import { Injectable } from "@nestjs/common";

@Injectable()
export class NotificationChannelService {
    async send(
        payload: any,
    ) {
        return true;
    }
}