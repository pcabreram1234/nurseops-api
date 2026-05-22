import { Injectable } from "@nestjs/common";

@Injectable()
export class NotificationPriorityValidator {
    private readonly allowedPriorities =
        [
            "LOW",
            "NORMAL",
            "HIGH",
            "CRITICAL",
        ];

    validate(
        priority: string,
    ) {
        return this.allowedPriorities.includes(
            priority,
        );
    }
}