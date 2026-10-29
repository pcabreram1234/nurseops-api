import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import { MailOptions } from "./interfaces/mail-options.interface";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Mail | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initTransporter();
  }

  private initTransporter() {
    const host = this.configService.get<string>("MAIL_HOST");
    const port = this.configService.get<number>("MAIL_PORT");
    const user = this.configService.get<string>("MAIL_USER");
    const pass = this.configService.get<string>("MAIL_PASS");

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: port || 587,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log("Mail transporter initialized");
    } else {
      this.logger.warn(
        "MAIL_HOST/MAIL_USER/MAIL_PASS not configured. Emails will be logged only.",
      );
    }
  }

  async send(options: MailOptions): Promise<boolean> {
    if (!this.transporter) {
      this.logger.log(`[MAIL LOG] To: ${options.to} | Subject: ${options.subject} | Body: ${options.text || options.html}`);
      return true;
    }

    try {
      const mailOptions: Mail.Options = {
        from: this.configService.get<string>("MAIL_FROM") || "noreply@nurseops.com",
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      return false;
    }
  }
}
