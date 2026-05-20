import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class IntegrationPayloadValidator {
  validate(payload: any) {
    if (!payload) {
      throw new BadRequestException("Payload required");
    }

    return true;
  }
}
