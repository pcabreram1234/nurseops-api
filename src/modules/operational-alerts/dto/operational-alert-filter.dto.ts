import { IsOptional, IsEnum, IsString } from 'class-validator';
import { OperationalAlertStatus, PriorityTypes } from '@prisma/client';

export class OperationalAlertFilterDto {
    @IsOptional()
    @IsString()
    departmentId?: string;

    @IsOptional()
    @IsEnum(OperationalAlertStatus)
    status?: OperationalAlertStatus;

    @IsOptional()
    @IsEnum(PriorityTypes)
    severity?: PriorityTypes;
}