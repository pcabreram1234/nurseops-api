import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString, IsBoolean } from "class-validator";
import { ContracTypeList, NurseStatusType } from "@prisma/client"; // Importa tus Enums de Prisma

export class CreateNurseDto {
  /*
  |--------------------------------------------------------------------------
  | DATOS PERSONALES (Para la tabla User)
  |--------------------------------------------------------------------------
  */
  // @IsString()
  // @IsNotEmpty({ message: "The name is mandatory" })
  // firstName!: string;

  // @IsString()
  // @IsNotEmpty({ message: "The last name is mandatory" })
  // lastName!: string;

  // @IsString()
  // // @IsNotEmpty({ message: "The email is mandatory" })
  // email!: string;

  @IsString()
  @IsNotEmpty({ message: "The userId is mandatory" })
  userId!: string

  @IsString()
  @IsNotEmpty({ message: "The organizationId is mandatory" })
  organizationId!: string

  @IsBoolean()
  @IsOptional()
  isCrossDepartmental!: boolean

  /*
  |--------------------------------------------------------------------------
  | RELACIONES OBLIGATORIAS (Campos requeridos en tu esquema Nurse)
  |--------------------------------------------------------------------------
  */
  @IsString()
  @IsNotEmpty({ message: "The department is mandatory." })
  departmentId!: string;

  @IsString()
  @IsOptional()
  branchId?: string;

  @IsString()
  @IsOptional()
  specialityId!: string;

  /*
  |--------------------------------------------------------------------------
  | METADATA LABORAL (Campos de tu esquema Nurse)
  |--------------------------------------------------------------------------
  */
  @IsEnum(ContracTypeList, { message: "The contract type is not valid" })
  @IsOptional()
  contract_type?: ContracTypeList = ContracTypeList.PERMANENT; // Coincide con tu @default(PERMANENT)

  @IsDateString({}, { message: "The hiring date must be a valid date." })
  @IsNotEmpty({ message: "The hiring date is mandatory." })
  hire_date!: string;

  @IsEnum(NurseStatusType, { message: "Invalid nurse status." })
  @IsOptional()
  status?: NurseStatusType = NurseStatusType.ACTIVE; // Coincide con tu @default(ACTIVE)

  @IsString()
  @IsOptional()
  employeeCode?: string; // Lo tenías en tu DTO anterior, es útil si manejas códigos internos del hospital
}