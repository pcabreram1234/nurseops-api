import { IsInt, IsString } from "class-validator";

export class GenerateTemplateDto {
  @IsString()
  templateId!: string;

  @IsInt()
  month!: number;

  @IsInt()
  year!: number;
}
