import { Injectable } from '@nestjs/common';

@Injectable()
export class FatigueScoreService {
    calculate(totalHours: number, nightHours: number, weekendHours: number): number {
        // Algoritmo matemático para predecir fatiga según el tipo de horas trabajadas
        let baseScore = (totalHours / 160) * 50; // Carga base mensual estándar
        baseScore += nightHours * 1.5;           // Las horas nocturnas desgastan un 50% más
        baseScore += weekendHours * 1.2;         // Las horas de fin de semana quitan descanso

        const finalScore = Math.min(baseScore, 100);
        return parseFloat(finalScore.toFixed(2));
    }
}