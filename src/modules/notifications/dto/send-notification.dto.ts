import { IsArray, IsEnum, IsOptional, IsString } from "class-validator";

export enum NotificationChannel {
  PUSH = "PUSH",
  EMAIL = "EMAIL",
  SMS = "SMS",
  IN_APP = "IN_APP",
}

export class SendNotificationDto {
  @IsArray()
  recipients!: string[];

  @IsString()
  title!: string;

  @IsString()
  message!: string;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsEnum(NotificationChannel, {
    each: true,
  })
  channels?: NotificationChannel[];
}
