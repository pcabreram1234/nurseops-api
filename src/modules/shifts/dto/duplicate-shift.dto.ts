import { IsDateString } from "class-validator";

export class DuplicateShiftDto {
  @IsDateString()
  startDate!: Date;

  @IsDateString()
  endDate!: Date;
}
