import { IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ActivitySeverity } from '../enums/activity-severity.enum';

export class ActivityFeedDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit: number = 15;

    @IsOptional()
    @IsEnum(ActivitySeverity)
    severity?: ActivitySeverity;
}