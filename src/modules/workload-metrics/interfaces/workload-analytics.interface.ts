export interface WorkloadAnalyticsSummary {
    organizationId: string;
    month: number;
    year: number;
    totalNursesAnalyzed: number;
    criticalBurnoutCount: number;
    averageFatigueScore: number;
    averageFairnessScore: number;
    imbalanceDetected: boolean;
}