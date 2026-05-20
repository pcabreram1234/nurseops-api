import { IsBoolean, IsOptional } from "class-validator";

export class GenerateScheduleDto {
  @IsOptional()
  @IsBoolean()
  forceRegenerate?: boolean;
}
