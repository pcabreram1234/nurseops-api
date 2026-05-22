export class ModuleCreatedEvent {
    constructor(public readonly moduleId: string, public readonly code: string) { }
}