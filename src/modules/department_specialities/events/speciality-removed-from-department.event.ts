export class SpecialityRemovedFromDepartmentEvent {
  constructor(
    public readonly departmentId: string,

    public readonly specialityId: string,
  ) {}
}
