import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class FeatureFlagFilterDto {
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    isActive?: boolean;
}