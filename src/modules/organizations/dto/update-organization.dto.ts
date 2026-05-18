import { PartialType } from "@nestjs/mapped-types";
import { CreateOrganizationDto } from "./create-organization.dto";

// PartialType toma todas las propiedades de CreateOrganizationDto, 
// mantiene sus validaciones exactas (IsString, Length, Matches, etc.) 
// pero les añade la regla de que ahora todas son opcionales (@IsOptional).
export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {}