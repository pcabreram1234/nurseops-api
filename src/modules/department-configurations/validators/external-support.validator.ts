import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class ExternalSupportValidator {
  validate(allowExternalSupport: boolean) {
    if (!allowExternalSupport) {
      throw new BadRequestException("External support not allowed");
    }

    return true;
  }
}
