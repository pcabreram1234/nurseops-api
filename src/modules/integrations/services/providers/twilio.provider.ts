import { Injectable } from "@nestjs/common";

import { IntegrationProvider } from "../../interfaces/integration-provider.interface";

@Injectable()
export class TwilioProvider implements IntegrationProvider {
  provider = "TWILIO";

  async send(payload: any) {
    /*
    |--------------------------------------------------------------------------
    | TWILIO SDK
    |--------------------------------------------------------------------------
    */

    return {
      success: true,
    };
  }
}
