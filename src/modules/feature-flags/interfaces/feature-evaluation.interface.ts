export interface FeatureEvaluationResult {
    featureName: string;
    isEnabled: boolean;
    evaluatedAt: Date;
    reason: string;
}