import { Injectable } from "@nestjs/common";

@Injectable()
export class SmsNotificationsService {
  async sendSMS(
    recipients: string[],

    message: string,
  ) {
    console.log("SMS sent", {
      recipients,
      message,
    });

    /*
    |--------------------------------------------------------------------------
    | TODO:
    |--------------------------------------------------------------------------
    |
    | Twilio
    | Vonage
    |
    */
  }
}
