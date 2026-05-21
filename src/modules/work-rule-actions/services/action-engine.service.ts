import { Injectable } from "@nestjs/common";

@Injectable()
export class ActionEngineService {
  async execute(action: any, context: any) {
    switch (action.action_type) {
      case "BLOCK_ASSIGNMENT":
        return {
          blocked: true,
        };

      case "SEND_ALERT":
        return {
          alertSent: true,
        };

      default:
        return {
          success: true,
        };
    }
  }
}
