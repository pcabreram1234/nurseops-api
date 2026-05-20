import { Module } from "@nestjs/common";

import { PrismaModule } from "@infra/database/prisma.module";

import { IntegrationsController } from "./controllers/integrations.controller";

import { IntegrationsService } from "./services/integrations.service";

import { IntegrationEngineService } from "./services/integration-engine.service";

import { ProviderFactoryService } from "./services/provider-factory.service";

import { TwilioProvider } from "./services/providers/twilio.provider";

import { SendgridProvider } from "./services/providers/sendgrid.provider";
import { IntegrationConfigValidator } from "./validators/integration-config.validator";
import { SendgridConfigValidator } from "./validators/sendgrid-config.validator";
import { TwilioConfigValidator } from "./validators/twilio-config.validator";
import { WebhookSignatureValidator } from "./validators/webhook-signature.validator";
import { IntegrationPayloadValidator } from "./validators/integration-payload.validator";

@Module({
  imports: [PrismaModule],

  controllers: [IntegrationsController],

  providers: [
    IntegrationsService,

    IntegrationEngineService,

    ProviderFactoryService,

    TwilioProvider,

    SendgridProvider,

    IntegrationConfigValidator,

    TwilioConfigValidator,

    SendgridConfigValidator,

    WebhookSignatureValidator,

    IntegrationPayloadValidator,
  ],

  exports: [IntegrationEngineService],
})
export class IntegrationsModule {}
