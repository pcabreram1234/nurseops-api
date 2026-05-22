import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { AlertEscalationTier } from '../enums/alert-escalation.enum';

export class EscalateOperationalAlertDto {
    @IsEnum(AlertEscalationTier)
    @IsNotEmpty()
    targetTier!: AlertEscalationTier;

    @IsString()
    @IsNotEmpty()
    reason!: string;
}