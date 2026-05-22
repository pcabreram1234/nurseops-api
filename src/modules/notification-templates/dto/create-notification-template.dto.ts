import {
    IsEnum,
    IsOptional,
    IsString,
} from "class-validator";

export class CreateNotificationTemplateDto {
    @IsString()
    code!: string;

    @IsString()
    name!: string;

    @IsString()
    bodyTemplate!: string;

    @IsOptional()
    @IsString()
    titleTemplate?: string;

    @IsOptional()
    @IsString()
    htmlTemplate?: string;

    @IsString()
    channel!: string;

    @IsOptional()
    variables?: any;
}