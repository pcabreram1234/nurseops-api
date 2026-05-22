import { Injectable } from "@nestjs/common";

@Injectable()
export class TemplateVariableValidator {
    validate(
        variables: string[],
    ) {
        return Array.isArray(
            variables,
        );
    }
}