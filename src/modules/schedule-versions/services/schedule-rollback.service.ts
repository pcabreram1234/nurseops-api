import { Injectable } from "@nestjs/common";

@Injectable()
export class ScheduleRollbackService {
  async rollback(version: any) {
    /*
    |--------------------------------------------------------------------------
    | FUTURE ROLLBACK ENGINE
    |--------------------------------------------------------------------------
    */

    return {
      restored: true,
    };
  }
}
