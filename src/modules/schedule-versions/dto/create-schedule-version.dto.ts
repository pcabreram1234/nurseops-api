import { IsBoolean, IsJSON, IsOptional, IsString } from "class-validator";

export class CreateScheduleVersionDto {
  @IsString()
  scheduleId!: string;

  @IsJSON()
  snapshot: any;

  @IsOptional()
  @IsString()
  changeSummary?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
