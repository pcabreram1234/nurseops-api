import { Injectable } from "@nestjs/common";

@Injectable()
export class NotificationPriorityService {
    calculatePriority(
        payload: any,
    ) {
        /*
        |--------------------------------------------------------------------------
        | FUTURE AI / SMART PRIORITIZATION
        |--------------------------------------------------------------------------
        */

        if (
            payload.priority ===
            "CRITICAL"
        ) {
            return {
                priority:
                    "CRITICAL",

                delay: 0,
            };
        }

        if (
            payload.priority ===
            "HIGH"
        ) {
            return {
                priority:
                    "HIGH",

                delay: 1000,
            };
        }

        return {
            priority: "NORMAL",

            delay: 5000,
        };
    }
}