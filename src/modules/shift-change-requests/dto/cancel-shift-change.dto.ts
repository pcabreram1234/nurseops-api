import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsOptional,
} from "class-validator";

export class CancelShiftChangeDto {
  @IsUUID("4")
  @IsOptional()
  requestId?: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
