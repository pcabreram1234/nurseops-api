import { Injectable } from "@nestjs/common";

@Injectable()
export class LiquidTemplateValidator {
    validate(
        template: string,
    ) {
        /*
        |--------------------------------------------------------------------------
        | VERY BASIC LIQUID VALIDATION
        |--------------------------------------------------------------------------
        */

        const openTags =
            (
                template.match(
                    /\{\{/g,
                ) || []
            ).length;

        const closeTags =
            (
                template.match(
                    /\}\}/g,
                ) || []
            ).length;

        return (
            openTags ===
            closeTags
        );
    }
}