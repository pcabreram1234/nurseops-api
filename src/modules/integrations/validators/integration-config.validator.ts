import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class IntegrationConfigValidator {
  validate(provider: string, configuration: any) {
    switch (provider) {
      case "TWILIO":
        this.validateTwilio(configuration);
        break;

      case "SENDGRID":
        this.validateSendgrid(configuration);
        break;

      default:
        break;
    }

    return true;
  }

  /*
  |--------------------------------------------------------------------------
  | TWILIO
  |--------------------------------------------------------------------------
  */

  private validateTwilio(configuration: any) {
    if (!configuration.accountSid) {
      throw new BadRequestException("Twilio accountSid required");
    }

    if (!configuration.authToken) {
      throw new BadRequestException("Twilio authToken required");
    }
  }

  /*
  |--------------------------------------------------------------------------
  | SENDGRID
  |--------------------------------------------------------------------------
  */

  private validateSendgrid(configuration: any) {
    if (!configuration.apiKey) {
      throw new BadRequestException("Sendgrid apiKey required");
    }
  }
}
