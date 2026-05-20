import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class SendgridConfigValidator {
  validate(config: any) {
    if (!config.apiKey) {
      throw new BadRequestException("Sendgrid apiKey required");
    }

    return true;
  }
}
