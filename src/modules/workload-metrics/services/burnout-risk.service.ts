import { Injectable } from '@nestjs/common';

@Injectable()
export class BurnoutRiskService {
    evaluateRisk(fatigueScore: number, workloadScore: number, overtimeHours: number): number {
        // Modelo matemático cruzado para estimación del Burnout clínico
        const weightFatigue = fatigueScore * 0.5;
        const weightWorkload = workloadScore * 0.3;
        const weightOvertime = Math.min((overtimeHours / 40) * 100, 100) * 0.2;

        const risk = weightFatigue + weightWorkload + weightOvertime;
        return parseFloat(Math.min(risk, 100).toFixed(2));
    }
}