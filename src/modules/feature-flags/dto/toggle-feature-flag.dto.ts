import { IsBoolean } from 'class-validator';

export class ToggleFeatureFlagDto {
    @IsBoolean()
    isActive!: boolean;
}