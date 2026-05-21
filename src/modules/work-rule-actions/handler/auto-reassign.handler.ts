import { Injectable } from "@nestjs/common";

@Injectable()
export class AutoReassignHandler {
  async execute(action: any, payload: any) {
    return {
      reassigned: true,
    };
  }
}
