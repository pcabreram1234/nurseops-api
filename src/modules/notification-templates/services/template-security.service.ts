import { Injectable } from "@nestjs/common";

@Injectable()
export class TemplateSecurityService {
    sanitize(
        content: string,
    ) {
        /*
        |--------------------------------------------------------------------------
        | REMOVE DANGEROUS TAGS
        |--------------------------------------------------------------------------
        */

        return content
            .replace(
                /<script.*?>.*?<\/script>/gis,
                "",
            )
            .replace(
                /javascript:/gis,
                "",
            )
            .replace(
                /onerror=/gis,
                "",
            )
            .replace(
                /onclick=/gis,
                "",
            );
    }

    validate(
        content: string,
    ) {
        /*
        |--------------------------------------------------------------------------
        | FUTURE SECURITY RULES
        |--------------------------------------------------------------------------
        */

        const blockedPatterns =
            [
                "<script",
                "eval(",
                "Function(",
            ];

        const found =
            blockedPatterns.find(
                (
                    pattern,
                ) =>
                    content.includes(
                        pattern,
                    ),
            );

        return {
            valid: !found,

            blockedPattern:
                found || null,
        };
    }
}