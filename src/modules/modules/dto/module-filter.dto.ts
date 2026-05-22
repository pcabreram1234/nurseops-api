import { IsOptional, IsBoolean, IsString } from 'class-validator';

export class ModuleFilterDto {
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsString()
    category?: string;
}