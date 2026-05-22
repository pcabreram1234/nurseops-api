import { Injectable } from '@nestjs/common';
import { FatigueScoreService } from './fatigue-score.service';
import { FairnessScoreService } from './fairness-score.service';
import { BurnoutRiskService } from './burnout-risk.service';

@Injectable()
export class WorkloadCalculationService {
    constructor(
        private readonly fatigueService: FatigueScoreService,
        private readonly fairnessService: FairnessScoreService,
        private readonly burnoutService: BurnoutRiskService,
    ) { }

    calculateMetrics(hoursMatrix: {
        total: number;
        overtime: number;
        night: number;
        weekend: number;
        teamAverageTotal: number;
    }) {
        const fatigue = this.fatigueService.calculate(hoursMatrix.total, hoursMatrix.night, hoursMatrix.weekend);

        // El score de carga de trabajo base está determinado por el cumplimiento de horas contractuales y extras
        const workload = Math.min(((hoursMatrix.total + hoursMatrix.overtime * 0.5) / 160) * 100, 100);

        const fairness = this.fairnessService.calculateIndividualFairness(hoursMatrix.total, hoursMatrix.teamAverageTotal);
        const burnout = this.burnoutService.evaluateRisk(fatigue, workload, hoursMatrix.overtime);

        return {
            fatigueScore: fatigue,
            workloadScore: parseFloat(workload.toFixed(2)),
            fairnessScore: fairness,
            burnoutRisk: burnout,
        };
    }
}