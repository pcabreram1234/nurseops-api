import { Injectable } from "@nestjs/common";

@Injectable()
export class NotificationAnalyticsService {
    async trackSent(
        payload: any,
    ) {
        console.log(
            "Tracking sent notification",
            payload,
        );
    }

    async trackOpened(
        payload: any,
    ) {
        console.log(
            "Tracking opened notification",
            payload,
        );
    }

    async trackFailed(
        payload: any,
    ) {
        console.log(
            "Tracking failed notification",
            payload,
        );
    }
}