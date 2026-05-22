import {
    IsEnum,
    IsOptional,
    IsString,
} from "class-validator";

import { TemplateChannelEnum } from "../enums/template-channel.enum";

import { TemplateStatusEnum } from "../enums/template-status.enum";

export class NotificationTemplateFilterDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(
        TemplateChannelEnum,
    )
    channel?: TemplateChannelEnum;

    @IsOptional()
    @IsEnum(
        TemplateStatusEnum,
    )
    status?: TemplateStatusEnum;

    @IsOptional()
    @IsString()
    language?: string;
}