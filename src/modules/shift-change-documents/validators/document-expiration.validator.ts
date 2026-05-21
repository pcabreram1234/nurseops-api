import { Injectable } from "@nestjs/common";

@Injectable()
export class DocumentExpirationValidator {
  validate(expiresAt?: Date) {
    if (!expiresAt) {
      return true;
    }

    return expiresAt > new Date();
  }
}
