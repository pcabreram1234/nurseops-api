import { IsOptional, IsString } from 'class-validator';

export class WebhookLogFilterDto {
    @IsOptional()
    @IsString()
    integrationId?: string;
}