import { OnEvent } from "@nestjs/event-emitter";

export class TemplateCreatedListener {
    @OnEvent(
        "template.created",
    )
    handle(
        payload: any,
    ) {
        console.log(
            "Template created",
            payload,
        );
    }
}