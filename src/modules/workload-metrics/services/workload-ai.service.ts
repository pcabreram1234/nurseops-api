import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WorkloadAiService {
  private readonly logger = new Logger(WorkloadAiService.name);

  async predictNextMonthOverload(historicalScores: number[]): Promise<{ riskFactor: number; recommendation: string }> {
    this.logger.log('Running a predictive regression model of workload...');
    if (historicalScores.length === 0) return { riskFactor: 10, recommendation: 'Insufficient data.' };

    const average = historicalScores.reduce((a, b) => a + b, 0) / historicalScores.length;
    const predictedRisk = Math.min(average * 1.1, 100); // Estimador simple con tendencia de fatiga incremental

    return {
      riskFactor: parseFloat(predictedRisk.toFixed(2)),
      recommendation: predictedRisk > 75 
        ? 'AI recommends blocking overtime allocation for the next cycle.' 
        : 'Predictive load within normal parameters.',
    };
  }
}