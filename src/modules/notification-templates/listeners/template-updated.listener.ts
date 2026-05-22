import { OnEvent } from "@nestjs/event-emitter";

export class TemplateUpdatedListener {
    @OnEvent(
        "template.updated",
    )
    async handle(
        payload: any,
    ) {
        console.log(
            "Template updated",
            payload,
        );
    }
}