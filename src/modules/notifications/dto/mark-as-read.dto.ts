import { IsArray, IsOptional, IsString } from "class-validator";

export class MarkAsReadDto {
  @IsOptional()
  @IsArray()
  notificationIds?: string[];

  @IsOptional()
  @IsString()
  notificationId?: string;
}
