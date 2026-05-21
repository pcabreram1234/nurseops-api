import { Injectable } from "@nestjs/common";

@Injectable()
export class DocumentAIService {
  async analyze(document: any) {
    return {
      valid: true,

      confidence: 95,
    };
  }
}
