import { Injectable } from "@nestjs/common";

@Injectable()
export class ShiftChangeApprovalService {
  async approve(request: any) {
    return {
      approved: true,
    };
  }
}
