import { IsString, IsOptional, IsBoolean, IsLatitude, IsLongitude } from "class-validator";

export class CreateBranchDto {
  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsString()
  address!: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsBoolean()
  isMainBranch?: boolean;

  @IsLatitude()
  @IsOptional()
  latitude: any;

  @IsLongitude()
  @IsOptional()
  longitude: any;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
