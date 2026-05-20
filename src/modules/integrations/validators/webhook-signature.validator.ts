import { Injectable, UnauthorizedException } from "@nestjs/common";

import * as crypto from "crypto";

@Injectable()
export class WebhookSignatureValidator {
  validate(payload: string, signature: string, secret: string) {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    if (expected !== signature) {
      throw new UnauthorizedException("Invalid webhook signature");
    }

    return true;
  }
}
