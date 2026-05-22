import { IsEnum, IsNotEmpty } from 'class-validator';
import { ModuleStatus } from '../enums/module-status.enum';

export class ModuleStatusDto {
    @IsEnum(ModuleStatus)
    @IsNotEmpty()
    status!: ModuleStatus;
}