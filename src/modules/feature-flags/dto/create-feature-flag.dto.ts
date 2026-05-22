import { IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { FeaturTypes } from '@prisma/client';

export class CreateFeatureFlagDto {
    @IsEnum(FeaturTypes)
    feature_name!: FeaturTypes;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean = false;
}