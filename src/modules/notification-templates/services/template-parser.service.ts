import { Injectable } from "@nestjs/common";

@Injectable()
export class TemplateParserService {
    extractVariables(
        template: string,
    ) {
        const regex =
            /\{\{(.*?)\}\}/g;

        return [
            ...template.matchAll(
                regex,
            ),
        ].map(
            (
                match,
            ) => match[1],
        );
    }
}