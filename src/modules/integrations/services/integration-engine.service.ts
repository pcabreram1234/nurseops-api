import { Injectable } from "@nestjs/common";

import { ProviderFactoryService } from "./provider-factory.service";

@Injectable()
export class IntegrationEngineService {
  constructor(private readonly providerFactory: ProviderFactoryService) {}

  async execute(
    integration: any,

    payload: any,
  ) {
    /*
    |--------------------------------------------------------------------------
    | PROVIDER
    |--------------------------------------------------------------------------
    */

    const provider = this.providerFactory.getProvider(integration.provider);

    if (!provider) {
      throw new Error("Provider not found");
    }

    /*
    |--------------------------------------------------------------------------
    | EXECUTE
    |--------------------------------------------------------------------------
    */

    return provider.send(payload);
  }
}
