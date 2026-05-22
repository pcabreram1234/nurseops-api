import { Injectable } from "@nestjs/common";

@Injectable()
export class HtmlTemplateValidator {
    validate(
        html: string,
    ) {
        return !html.includes(
            "<script",
        );
    }
}