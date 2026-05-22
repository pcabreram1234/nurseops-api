export class ModuleDisabledEvent {
    constructor(public readonly moduleId: string, public readonly code: string) { }
}