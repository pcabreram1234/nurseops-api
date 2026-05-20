import { Injectable } from "@nestjs/common";

@Injectable()
export class EmergencyRankingService {
  rankCandidates(candidates: any[]) {
    return candidates.sort(
      (a, b) => b.compatibilityScore - a.compatibilityScore,
    );
  }
}
