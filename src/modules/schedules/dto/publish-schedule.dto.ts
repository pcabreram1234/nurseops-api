import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

export class PublishScheduleDto {
  @IsOptional()
  @IsBoolean()
  notifyStaff?: boolean;

  @IsOptional()
  @IsBoolean()
  createVersionSnapshot?: boolean;

  @IsOptional()
  @IsBoolean()
  forcePublish?: boolean;

  @IsOptional()
  @IsBoolean()
  validateBeforePublish?: boolean;

  @IsOptional()
  @IsObject()
  sendPushNotifications?: {
    publish: boolean
    sendPushNotifications: boolean
    sendEmails: boolean
  };

  @IsOptional()
  @IsBoolean()
  sendEmails?: boolean;

  @IsOptional()
  @IsString()
  publicationNotes?: string;

  @IsString()
  @IsNotEmpty()
  scheduleId!: string
}
