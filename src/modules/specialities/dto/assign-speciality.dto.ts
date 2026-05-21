import { IsString } from "class-validator";

export class AssignSpecialityDto {
  @IsString()
  nurseId!: string;

  @IsString()
  specialityId!: string;
}
