import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsOptional,
    IsString,
    IsUUID,
} from "class-validator";

export class CreateNotificationTypeDto {

    @IsString()
    organizationId!: string;

    @IsString()
    code!: string;

    @IsString()
    name!: string;

    @IsString()
    category!: string;

    @IsString()
    priority!: string;

    @IsUUID()
    templateId!: string;

    @IsOptional()
    @IsString()
    icon?: string;

    @IsOptional()
    @IsArray()
    channels?: string[];

    @IsOptional()
    @IsBoolean()
    allowPush?: boolean;

    @IsOptional()
    @IsBoolean()
    allowEmail?: boolean;

    @IsOptional()
    @IsBoolean()
    allowSMS?: boolean;
}