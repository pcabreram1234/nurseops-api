import {
    IsArray,
    IsOptional,
    IsString,
} from "class-validator";

export class SendTestNotificationDto {
    @IsString()
    notificationTypeCode!: string;

    @IsOptional()
    payload?: any;

    @IsOptional()
    @IsArray()
    channels?: string[];
}