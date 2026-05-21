import { Injectable } from "@nestjs/common";

@Injectable()
export class OvertimeValidator {
  async validate(payload: any) {
    return {
      valid: true,
    };
  }
}
