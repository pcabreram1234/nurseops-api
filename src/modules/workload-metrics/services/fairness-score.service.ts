import { Injectable } from '@nestjs/common';

@Injectable()
export class FairnessScoreService {
    calculateIndividualFairness(nurseHours: number, averageTeamHours: number): number {
        if (averageTeamHours === 0) return 100;

        // Calcula la desviación respecto a la media de la planta
        const deviation = Math.abs(nurseHours - averageTeamHours) / averageTeamHours;
        const score = 100 * (1 - Math.min(deviation, 1));

        return parseFloat(score.toFixed(2));
    }
}