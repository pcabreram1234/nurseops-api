import { OnEvent } from "@nestjs/event-emitter";

import { InjectQueue } from "@nestjs/bullmq";

import { Queue } from "bullmq";

export class AuditCreatedListener {
    constructor(
        @InjectQueue(
            "audit",
        )
        private readonly auditQueue: Queue,
    ) { }

    @OnEvent(
        "audit.created",
    )
    async handle(
        payload: any,
    ) {
        await this.auditQueue.add(
            "persist-audit",
            payload,
        );
    }
}