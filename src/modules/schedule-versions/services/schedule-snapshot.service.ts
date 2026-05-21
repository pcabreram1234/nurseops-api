import { Injectable } from "@nestjs/common";

@Injectable()
export class ScheduleSnapshotService {
  async generateSnapshot(schedule: any) {
    return {
      schedule,
    };
  }
}
