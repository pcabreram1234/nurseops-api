import { IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class ValidateAssignmentDto {
  @IsOptional()
  @IsString()
  entryId?: string; // Opcional porque puede ser un slot nuevo aún no persistido

  @IsNotEmpty()
  @IsString()
  nurseId!: string;

  @IsNotEmpty()
  @IsString()
  shiftId!: string; // ID del turno (Shift o ShiftTemplate) a simular

  @IsNotEmpty()
  @IsDateString()
  date!: string; // Fecha del slot a evaluar
}