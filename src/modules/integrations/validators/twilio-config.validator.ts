import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class TwilioConfigValidator {
  validate(config: any) {
    const requiredFields = ["accountSid", "authToken", "phoneNumber"];

    for (const field of requiredFields) {
      if (!config[field]) {
        throw new BadRequestException(`Missing field ${field}`);
      }
    }

    return true;
  }
}
