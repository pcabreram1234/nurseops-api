// 📄 @/modules/schedules/dto/create-bulk-schedule-entry.dto.ts
import {
    IsNotEmpty,
    IsString,
    IsOptional,
    IsArray,
    ValidateNested,
    IsDateString
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 1. DTO para validar cada fila individual dentro del lote (Co-piloto masivo)
 */
export class BulkEntryItemDto {
    @IsOptional() // 🟢 Permitimos IsOptional porque si el usuario elige "Dejar Vacante", llegará "" o null
    @IsString({ message: 'The staff ID must be a valid text string.' })
    nurseId!: string;

    @IsNotEmpty({ message: 'The shift/time ID is required for each row.' })
    @IsString({ message: 'The schedule ID must be a valid text string.' })
    shiftId!: string;

    @IsOptional()
    @IsString({ message: 'Additional notes should be text..' })
    notes?: string;

    @IsNotEmpty()
    @IsString()
    shiftTemplateId!: string;
}

/**
 * 2. DTO Maestro para validar la petición completa de creación masiva
 */
export class CreateBulkScheduleEntryDto {
    @IsNotEmpty({ message: 'The assignment date for the calendar is mandatory.' })
    @IsDateString({}, { message: 'The date must comply with a valid ISO format (YYYY-MM-DD).' })
    date!: string;

    @IsNotEmpty({ message: 'The assignment list cannot be empty..' })
    @IsArray({ message: 'The entries must be sent within a structured array.' })
    @ValidateNested({ each: true }) // 🌟 CRÍTICO: Obliga a class-validator a inspeccionar dentro de cada objeto del arreglo
    @Type(() => BulkEntryItemDto)   // 🌟 CRÍTICO: Le indica a class-transformer bajo qué clase moldear el sub-objeto
    entries!: BulkEntryItemDto[];

    @IsNotEmpty()
    @IsString()
    scheduleId!: string;

}