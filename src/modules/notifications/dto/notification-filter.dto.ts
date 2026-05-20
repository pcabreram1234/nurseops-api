import { IsBoolean, IsOptional } from "class-validator";

export class NotificationFilterDto {
  @IsOptional()
  @IsBoolean()
  unreadOnly?: boolean;
}
