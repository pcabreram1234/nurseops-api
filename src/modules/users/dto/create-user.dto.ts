import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsUUID()
  organizationId!: string;

  @IsString()
  departmentId!: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsString()
  rolesId!: string;

  @IsString()
  status!: 'ACTIVE' | 'INACTIVE' | 'VACATION' | 'LICENSE' | 'SUSPENDED'

}
