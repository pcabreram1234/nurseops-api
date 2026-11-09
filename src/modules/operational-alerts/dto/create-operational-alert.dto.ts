import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { OperationalAlertyTypes, PriorityTypes } from '@prisma/client';

export class CreateOperationalAlertDto {
    @IsString()
    @IsNotEmpty()
    departmentId!: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    organizationId?: string;

    @IsEnum(OperationalAlertyTypes)
    @IsNotEmpty()
    alertType!: OperationalAlertyTypes;

    @IsEnum(PriorityTypes)
    @IsNotEmpty()
    severity!: PriorityTypes;
}