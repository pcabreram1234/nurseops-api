import { Injectable } from "@nestjs/common";

@Injectable()
export class StaffingRulesService {
  validateMinimumStaff(currentStaff: number, minimumRequired: number) {
    return currentStaff >= minimumRequired;
  }
}
