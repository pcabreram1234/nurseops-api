import { IsString, IsNotEmpty } from 'class-validator';

export class ReplayWebhookDto {
    @IsString()
    @IsNotEmpty()
    webhookLogId!: string;
}