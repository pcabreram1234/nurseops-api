import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNotEmpty,
} from "class-validator";
import { ChangeApprovalsTypes } from "@prisma/client";

export class RespondShiftChangeDto {
  @IsEnum(ChangeApprovalsTypes)
  decision!: ChangeApprovalsTypes;

  @IsString()
  @IsOptional()
  comments?: string;
}
