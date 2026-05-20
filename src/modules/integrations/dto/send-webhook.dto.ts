import { IsObject, IsString } from "class-validator";

export class SendWebhookDto {
  @IsString()
  integrationId!: string;

  @IsObject()
  payload: any;
}
