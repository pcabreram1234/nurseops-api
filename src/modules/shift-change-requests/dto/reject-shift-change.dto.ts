import { IsString } from "class-validator";

export class RejectShiftChangeDto {
  @IsString()
  reason!: string;
}
