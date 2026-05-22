import {
    IsObject,
    IsString,
} from "class-validator";

export class RenderTemplateDto {
    @IsString()
    code!: string;

    @IsObject()
    payload: any;
}