export class FeatureDisabledEvent {
    constructor(public readonly featureName: string, public readonly updatedById?: string) { }
}