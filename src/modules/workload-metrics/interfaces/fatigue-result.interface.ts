import { FatigueLevel } from '../enums/fatigue-level.enum';
export interface FatigueResult {
    score: number;
    level: FatigueLevel;
    consecutiveNightsCount: number;
    hasRestViolation: boolean;
}