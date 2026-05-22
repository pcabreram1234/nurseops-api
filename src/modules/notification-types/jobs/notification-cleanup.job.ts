import { Processor } from "@nestjs/bullmq";

@Processor(
    "notification-cleanup",
)
export class NotificationCleanupJob {
    async handle() {
        /*
        |--------------------------------------------------------------------------
        | FUTURE CLEANUP LOGIC
        |--------------------------------------------------------------------------
        */

        console.log(
            "Cleaning old notifications...",
        );
    }
}