export interface OptimizationResultStructure {
    assignedShiftsCount: number;
    conflictsResolvedCount: number;
    finalScore: number;
    processingTimeMs: number;
    violationsEvaded: string[];
}