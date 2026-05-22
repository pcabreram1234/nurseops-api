import {
    IsObject,
    IsString,
} from "class-validator";

export class PreviewTemplateDto {
    @IsString()
    templateId!: string;

    @IsObject()
    payload: any;
}