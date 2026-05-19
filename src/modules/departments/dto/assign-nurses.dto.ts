import { IsArray, ArrayNotEmpty, IsUUID } from "class-validator";

export class AssignNursesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID("4", {
    each: true,
  })
  nurseIds!: string[];
}
