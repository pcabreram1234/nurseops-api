import { Injectable } from "@nestjs/common";

@Injectable()
export class DocumentSecurityService {
  async validateAccess(payload: any) {
    return true;
  }
}
