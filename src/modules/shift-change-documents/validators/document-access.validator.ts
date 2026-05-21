import { Injectable } from "@nestjs/common";

@Injectable()
export class DocumentAccessValidator {
  async validate(payload: any) {
    return true;
  }
}
