import { IsString, IsNotEmpty, IsInt, Min, Max } from 'class-validator';

export class RetryWebhookDto {
    @IsString()
    @IsNotEmpty()
    webhookLogId!: string;

    @IsInt()
    @Min(1)
    @Max(5)
    attempt!: number;
}