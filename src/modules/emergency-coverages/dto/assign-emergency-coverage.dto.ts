import { IsString } from "class-validator";

export class AssignEmergencyCoverageDto {
  @IsString()
  nurseId!: string;
}
