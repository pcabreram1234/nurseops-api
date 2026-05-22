import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { OperationalAlertyTypes, PriorityTypes } from '@prisma/client';

export class CreateOperationalAlertDto {
    @IsString()
    @IsNotEmpty()
    departmentId!: string;

    @IsEnum(OperationalAlertyTypes)
    @IsNotEmpty()
    alertType!: OperationalAlertyTypes;

    @IsEnum(PriorityTypes)
    @IsNotEmpty()
    severity!: PriorityTypes;
}