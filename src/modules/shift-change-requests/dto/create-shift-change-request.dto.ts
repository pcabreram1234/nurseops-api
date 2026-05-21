import { IsBoolean, IsOptional, IsString } from "class-validator";

export class CreateShiftChangeRequestDto {
  @IsString()
  requesterId!: string;

  @IsOptional()
  @IsString()
  receiverId?: string;

  @IsString()
  sourceShiftId!: string;

  @IsOptional()
  @IsString()
  targetShiftId?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsBoolean()
  emergencyRequest?: boolean;
}
