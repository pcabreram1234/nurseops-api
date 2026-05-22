import { Injectable } from "@nestjs/common";

@Injectable()
export class AuditSanitizerService {
    private readonly sensitiveFields =
        [
            "password",
            "token",
            "refreshToken",
            "accessToken",
            "secret",
            "apiKey",
        ];

    sanitize(
        data: any,
    ) {
        if (!data) {
            return data;
        }

        const cloned =
            JSON.parse(
                JSON.stringify(
                    data,
                ),
            );

        this.removeSensitive(
            cloned,
        );

        return cloned;
    }

    private removeSensitive(
        obj: any,
    ) {
        if (
            !obj ||
            typeof obj !==
            "object"
        ) {
            return;
        }

        for (const key of Object.keys(
            obj,
        )) {
            if (
                this.sensitiveFields.includes(
                    key,
                )
            ) {
                obj[key] =
                    "***REDACTED***";
            } else {
                this.removeSensitive(
                    obj[key],
                );
            }
        }
    }
}