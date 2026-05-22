import { Injectable } from "@nestjs/common";

@Injectable()
export class TemplateSizeValidator {
    validate(
        template: string,
    ) {
        /*
        |--------------------------------------------------------------------------
        | MAX TEMPLATE SIZE
        |--------------------------------------------------------------------------
        */

        return (
            template.length <
            50000
        );
    }
}