import { Injectable } from "@nestjs/common";

@Injectable()
export class MimeTypeValidator {
  validate(mimeType: string) {
    const allowed = ["application/pdf", "image/png", "image/jpeg"];

    return allowed.includes(mimeType);
  }
}
