import { Injectable } from "@nestjs/common";

@Injectable()
export class BlockAssignmentHandler {
  async execute(action: any, context: any) {
    return {
      blocked: true,
    };
  }
}
