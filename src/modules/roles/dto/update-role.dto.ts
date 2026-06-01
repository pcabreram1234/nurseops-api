import { PartialType } from "@nestjs/mapped-types";
import { CreateRoleDto } from "./create-role.dto";
import { IsString, IsNotEmpty } from "class-validator";

// PartialType toma todas las propiedades de CreateOrganizationDto, 
// mantiene sus validaciones exactas (IsString, Length, Matches, etc.) 
// pero les añade la regla de que ahora todas son opcionales (@IsOptional).
export class UpdateRoleDto extends PartialType(CreateRoleDto) {
    @IsString()
    @IsNotEmpty()
    id!: string | string[] | [];
}