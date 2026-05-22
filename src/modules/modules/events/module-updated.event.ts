export class ModuleUpdatedEvent {
    constructor(public readonly moduleId: string, public readonly code: string) { }
}