import {
  IsOptional,
  IsString,
} from 'class-validator';

export class QueryPermissionsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  module?: string;
}