import { IsString, IsNotEmpty, IsObject, IsEnum } from 'class-validator';
import { ActivityLogType } from '@prisma/client'; // Asumiendo que existe en tu Prisma Schema

export class CreateActivityLogDto {
    @IsString()
    @IsNotEmpty()
    userId!: string;

    @IsEnum(ActivityLogType)
    @IsNotEmpty()
    action!: ActivityLogType;

    @IsObject()
    @IsNotEmpty()
    details!: Record<string, any>;
}