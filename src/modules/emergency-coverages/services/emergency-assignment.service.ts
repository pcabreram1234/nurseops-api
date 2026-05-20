import { Injectable } from "@nestjs/common";

@Injectable()
export class EmergencyAssignmentService {
  async assignBestCandidate(candidates: any[]) {
    /*
    |--------------------------------------------------------------------------
    | FUTURE SMART ASSIGNMENT
    |--------------------------------------------------------------------------
    */

    return candidates[0];
  }
}
