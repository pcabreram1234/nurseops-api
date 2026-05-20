import { Injectable } from "@nestjs/common";

import { TwilioProvider } from "./providers/twilio.provider";

import { SendgridProvider } from "./providers/sendgrid.provider";

@Injectable()
export class ProviderFactoryService {
  constructor(
    private readonly twilioProvider: TwilioProvider,

    private readonly sendgridProvider: SendgridProvider,
  ) {}

  getProvider(provider: string) {
    switch (provider) {
      case "TWILIO":
        return this.twilioProvider;

      case "SENDGRID":
        return this.sendgridProvider;

      default:
        return null;
    }
  }
}
