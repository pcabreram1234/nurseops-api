export class ActivityArchivedEvent {
    constructor(public readonly totalArchived: number, public readonly beforeDate: Date) { }
}