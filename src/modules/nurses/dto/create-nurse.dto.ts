import { IsString, IsNotEmpty, IsUUID, IsEnum, IsOptional, IsDateString } from "class-validator";
import { ContracTypeList, NurseStatusType } from "@prisma/client"; // Importa tus Enums de Prisma

export class CreateNurseDto {
  /*
  |--------------------------------------------------------------------------
  | DATOS PERSONALES (Para la tabla User)
  |--------------------------------------------------------------------------
  */
  @IsString()
  @IsNotEmpty({ message: "The name is mandatory" })
  firstName!: string;

  @IsString()
  @IsNotEmpty({ message: "The last name is mandatory" })
  lastName!: string;

  @IsString()
  @IsNotEmpty({ message: "The email is mandatory" })
  email!: string;

  /*
  |--------------------------------------------------------------------------
  | RELACIONES OBLIGATORIAS (Campos requeridos en tu esquema Nurse)
  |--------------------------------------------------------------------------
  */
  @IsUUID("4", { message: "The departmentId must be a valid UUID." })
  @IsNotEmpty({ message: "The department is mandatory." })
  departmentId!: string;

  @IsUUID("4", { message: "The specialityId must be a valid UUID." })
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