import {
    IsOptional,
    IsString,
} from "class-validator";

export class NotificationTypeFilterDto {
    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    priority?: string;

    @IsOptional()
    @IsString()
    search?: string;
}