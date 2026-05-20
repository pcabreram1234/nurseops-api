import { Injectable } from "@nestjs/common";

import { IntegrationProvider } from "../../interfaces/integration-provider.interface";

@Injectable()
export class SendgridProvider implements IntegrationProvider {
  provider = "SENDGRID";

  async send(payload: any) {
    return {
      success: true,
    };
  }
}
