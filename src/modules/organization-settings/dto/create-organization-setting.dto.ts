import { IsBoolean, IsInt, IsUUID, IsOptional } from "class-validator";

export class CreateOrganizationSettingDto {
  @IsUUID()
  organizationId!: string;

  @IsOptional()
  @IsBoolean()
  birthday_free_day_enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  require_shift_approval?: boolean;

  @IsOptional()
  @IsBoolean()
  auto_balance_nights?: boolean;

  @IsOptional()
  @IsBoolean()
  allow_cross_department?: boolean;

  @IsOptional()
  @IsBoolean()
  allow_overtime?: boolean;

  @IsOptional()
  @IsInt()
  max_monthly_hours?: number;

  @IsOptional()
  @IsInt()
  max_weekly_hours?: number;

  @IsOptional()
  @IsInt()
  overtime_limit?: number;

  @IsOptional()
  @IsInt()
  max_nights?: number;

  @IsOptional()
  @IsInt()
  max_consecutive_nights?: number;

  @IsOptional()
  @IsInt()
  minimum_rest_hours?: number;

  @IsOptional()
  @IsInt()
  max_consecutive_days?: number;

  @IsOptional()
  @IsBoolean()
  auto_assign_emergency?: boolean;

  @IsOptional()
  @IsBoolean()
  auto_approve_swaps?: boolean;
}
