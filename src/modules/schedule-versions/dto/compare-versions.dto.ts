import { IsInt, IsString } from "class-validator";

export class CompareVersionsDto {
  @IsString()
  scheduleId!: string;

  @IsInt()
  sourceVersion!: number;

  @IsInt()
  targetVersion!: number;
}
