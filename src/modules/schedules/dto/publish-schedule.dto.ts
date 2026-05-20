import { IsBoolean, IsOptional, IsString } from "class-validator";

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
  @IsBoolean()
  sendPushNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  sendEmails?: boolean;

  @IsOptional()
  @IsString()
  publicationNotes?: string;
}
