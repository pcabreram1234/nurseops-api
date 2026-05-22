export class FeatureEnabledEvent {
    constructor(public readonly featureName: string, public readonly updatedById?: string) { }
}