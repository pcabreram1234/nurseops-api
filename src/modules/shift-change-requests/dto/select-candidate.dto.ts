import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsOptional,
} from "class-validator";

export class SelectCandidateDto {
  @IsUUID("4")
  @IsNotEmpty()
  candidateNurseId!: string;

  @IsString()
  @IsOptional()
  comments?: string;
}
