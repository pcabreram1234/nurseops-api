import { IsArray, IsBoolean, IsOptional, IsString, IsDateString, ArrayMinSize } from 'class-validator';

export class SyncNurseRestrictionDto {
    @IsOptional()
    @IsArray({ message: 'nurseIds debe ser un arreglo de identificadores' })
    nurseIds!: string[];

    @IsString()
    restrictionTypeId!: string;

    @IsBoolean({ message: 'isTemporary debe ser un valor booleano' })
    isTemporary!: boolean;

    @IsBoolean({ message: 'isActive debe ser un valor booleano' })
    isActive!: boolean;

    @IsOptional()
    @IsDateString({}, { message: 'startDate debe ser una fecha válida o un string ISO' })
    startDate?: string;

    @IsOptional()
    @IsDateString({}, { message: 'endDate debe ser una fecha de vencimiento válida o un string ISO' })
    endDate?: string;

    @IsOptional()
    @IsString({ message: 'notes debe ser una cadena de texto' })
    notes?: string;
}