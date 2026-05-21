import { Injectable } from "@nestjs/common";

@Injectable()
export class SpecialityCoverageService {
  calculateCoverage(assigned: number, minimum: number) {
    return assigned >= minimum;
  }
}
