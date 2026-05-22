import { Injectable } from "@nestjs/common";

@Injectable()
export class TemplatePreviewService {
    preview(template: string, payload: any,
    ) {
        let result = template;

        for (const key in payload) {
            result =
                result.replaceAll(
                    `{{${key}}}`,
                    payload[key],
                );
        }

        return {
            preview: result,
        };
    }
}