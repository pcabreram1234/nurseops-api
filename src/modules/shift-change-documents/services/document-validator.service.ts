import { Injectable } from "@nestjs/common";

@Injectable()
export class DocumentValidatorService {
  async validate(payload: any) {
    return {
      valid: true,
    };
  }
}
