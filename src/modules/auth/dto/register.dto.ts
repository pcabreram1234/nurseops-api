import { 
  IsEmail, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  IsUUID, 
  MinLength 
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'The email address is invalid.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email!: string;

  @IsString({ message: 'The password must be a text string.' })
  @IsNotEmpty({ message: 'A password is required.' })
  @MinLength(6, { message: 'The password must be at least 6 characters long.' })
  password!: string;

  @IsString({ message: 'The name must be a text string.' })
  @IsNotEmpty({ message: 'Name is required.' })
  firstName!: string;

  @IsString({ message: 'The last name must be a text string.' })
  @IsNotEmpty({ message: 'The surname is mandatory.' })
  lastName!: string;

  @IsUUID('4', { message: 'The organization ID must be a valid UUID.' })
  @IsNotEmpty({ message: 'The organization ID is required.' })
  organizationId!: string;

  // De acuerdo a tu schema.prisma, el departamento es opcional (?)
  @IsUUID('4', { message: 'The department ID must be a valid UUID.' })
  @IsOptional()
  departmentId?: string;

  // De acuerdo a tu schema.prisma, el rol es opcional (?)
  @IsUUID('4', { message: 'The role ID must be a valid UUID.' })
  @IsOptional()
  rolesId?: string;
}