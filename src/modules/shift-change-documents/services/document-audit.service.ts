import { Injectable } from "@nestjs/common";

@Injectable()
export class DocumentAuditService {
  async register(payload: any) {
    return true;
  }
}
