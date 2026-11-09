import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsOptional,
} from "class-validator";

export class ApplyToCoverageDto {
  @IsUUID("4")
  @IsNotEmpty()
  requestId!: string;

  @IsString()
  @IsOptional()
  comments?: string;
}
