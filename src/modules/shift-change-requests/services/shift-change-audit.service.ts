import { Injectable } from "@nestjs/common";

@Injectable()
export class ShiftChangeAuditService {
  async register(payload: any) {
    return true;
  }
}
