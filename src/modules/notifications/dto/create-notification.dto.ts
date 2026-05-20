import { IsEnum, IsJSON, IsOptional, IsString } from "class-validator";

import { PriorityTypes } from "@prisma/client";

export class CreateNotificationDto {
  @IsString()
  userId!: string;

  @IsString()
  organizationId!: string;

  @IsString()
  title!: string;

  @IsString()
  message!: string;

  @IsEnum(PriorityTypes)
  priority!: PriorityTypes;

  @IsOptional()
  @IsJSON()
  data: any;
}
