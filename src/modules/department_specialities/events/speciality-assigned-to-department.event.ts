export class SpecialityAssignedToDepartmentEvent {
  constructor(
    public readonly departmentId: string,

    public readonly specialityId: string,
  ) {}
}
