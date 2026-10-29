import { Injectable, Logger } from "@nestjs/common";
import { MailService } from "@infra/mail/mail.service";

@Injectable()
export class EmailNotificationsService {
  private readonly logger = new Logger(EmailNotificationsService.name);

  constructor(private readonly mailService: MailService) {}

  async sendEmail(
    recipients: { email: string; name?: string }[],
    subject: string,
    message: string,
    html?: string,
  ): Promise<boolean> {
    if (recipients.length === 0) {
      this.logger.warn("No recipients to send email");
      return true;
    }

    const emails = recipients.map((r) => r.email).filter(Boolean);
    if (emails.length === 0) {
      this.logger.warn("No valid email addresses provided");
      return false;
    }

    return this.mailService.send({
      to: emails,
      subject,
      text: message,
      html: html || message.replace(/\n/g, "<br>"),
    });
  }
}
