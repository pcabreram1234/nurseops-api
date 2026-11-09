import {
  IsNotEmpty,
  IsString, IsOptional, IsNumberString
} from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}