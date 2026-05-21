import { IsBoolean } from "class-validator";

export class RollbackScheduleDto {
  @IsBoolean()
  restoreEntries!: boolean;
}
