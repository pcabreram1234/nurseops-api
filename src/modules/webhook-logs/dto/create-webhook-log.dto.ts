import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class CreateWebhookLogDto {
    @IsString()
    @IsNotEmpty()
    integrationId!: string;

    @IsObject()
    @IsNotEmpty()
    payload!: Record<string, any>;

    @IsObject()
    @IsNotEmpty()
    response!: Record<string, any>;
}