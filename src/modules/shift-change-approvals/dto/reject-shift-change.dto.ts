import { IsString, IsNotEmpty } from "class-validator";

export class RejectShiftChangeDto {
  @IsString()
  @IsNotEmpty({ message: "The reason for rejection is mandatory." })
  reason!: string;
}
