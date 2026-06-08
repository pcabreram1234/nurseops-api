import { IsString, IsNotEmpty, IsNumber, Min, Max } from "class-validator";

export class GenerateScheduleDto {
  @IsString()
  @IsNotEmpty({ message: "The department is required to run the rules engine." })
  departmentId!: string;

  @IsNumber()
  @Min(1, { message: "The month must be between 1 and 12." })
  @Max(12, { message: "The month must be between 1 and 12." })
  month!: number;

  @IsNumber()
  @Min(new Date().getFullYear(), { message: "The specified year is not valid for planning." })
  year!: number;
}
