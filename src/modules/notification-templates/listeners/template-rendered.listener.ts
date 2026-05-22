import { OnEvent } from "@nestjs/event-emitter";

export class TemplateRenderedListener {
    @OnEvent(
        "template.rendered",
    )
    async handle(
        payload: any,
    ) {
        console.log(
            "Template rendered",
            payload,
        );
    }
}