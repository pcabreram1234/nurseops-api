import { Injectable } from "@nestjs/common";

@Injectable()
export class EmailNotificationsService {
  async sendEmail(
    recipients: string[],

    subject: string,

    message: string,
  ) {
    console.log("Email sent", {
      recipients,
      subject,
      message,
    });

    /*
    |--------------------------------------------------------------------------
    | TODO:
    |--------------------------------------------------------------------------
    |
    | Resend
    | SES
    | Sendgrid
    |
    */
  }
}
