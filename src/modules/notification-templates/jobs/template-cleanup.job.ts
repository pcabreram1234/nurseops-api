import { Processor } from "@nestjs/bullmq";

@Processor(
    "template-cleanup",
)
export class TemplateCleanupJob {
    async handle() {
        /*
        |--------------------------------------------------------------------------
        | FUTURE CLEANUP LOGIC
        |--------------------------------------------------------------------------
        */

        console.log(
            "Cleaning old templates...",
        );
    }
}