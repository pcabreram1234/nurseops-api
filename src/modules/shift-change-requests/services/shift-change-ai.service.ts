import { Injectable } from "@nestjs/common";

@Injectable()
export class ShiftChangeAIService {
  async recommend(payload: any) {
    return {
      recommendation: "APPROVE",
    };
  }
}
