import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ModuleCategory } from '../enums/module-category.enum';

export class CreateModuleDto {
    @IsString()
    @IsNotEmpty()
    code!: string;

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    description!: string;

    @IsEnum(ModuleCategory)
    @IsOptional()
    category?: string;

    @IsString()
    @IsOptional()
    version?: string;

    @IsString()
    @IsOptional()
    icon?: string;

    @IsString()
    @IsOptional()
    route?: string;

    @IsBoolean()
    isCore!: boolean;

    @IsBoolean()
    isSystem!: boolean;

    @IsBoolean()
    isActive!: boolean;
}