import { Injectable } from "@nestjs/common";

@Injectable()
export class TemplateAIService {
    async optimize(
        payload: any,
    ) {
        /*
        |--------------------------------------------------------------------------
        | FUTURE AI OPTIMIZATION
        |--------------------------------------------------------------------------
        */

        return {
            suggestedTitle:
                payload.title,

            readabilityScore: 90,

            engagementPrediction:
                82,

            recommendations:
                [],
        };
    }

    async detectMissingVariables(
        template: string,

        payload: any,
    ) {
        const regex =
            /\{\{(.*?)\}\}/g;

        const variables =
            [
                ...template.matchAll(
                    regex,
                ),
            ].map(
                (
                    item,
                ) => item[1],
            );

        return variables.filter(
            (
                variable,
            ) =>
                !payload[
                variable
                ],
        );
    }
}