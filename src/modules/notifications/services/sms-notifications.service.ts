import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class SmsNotificationsService {
  private readonly logger = new Logger(SmsNotificationsService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendSMS(
    recipients: { phone: string }[],
    message: string,
  ): Promise<boolean> {
    const phones = recipients.map((r) => r.phone).filter(Boolean);
    if (phones.length === 0) {
      this.logger.warn("No phone numbers provided");
      return true;
    }

    const accountSid = this.configService.get<string>("TWILIO_ACCOUNT_SID");
    const authToken = this.configService.get<string>("TWILIO_AUTH_TOKEN");

    if (!accountSid || !authToken) {
      this.logger.log(`[SMS LOG] To: ${phones.join(", ")} | Body: ${message}`);
      return true;
    }

    try {
      const twilioModule = await import("twilio");
      const twilioClient = (twilioModule.default || twilioModule)(accountSid, authToken);

      const results = await Promise.allSettled(
        phones.map((phone) =>
          twilioClient.messages.create({
            body: message,
            from: this.configService.get<string>("TWILIO_PHONE_NUMBER"),
            to: phone,
          }),
        ),
      );

      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      this.logger.log(`SMS: ${succeeded}/${phones.length} sent`);
      return succeeded > 0;
    } catch (error) {
      this.logger.error("Twilio SMS failed", error);
      return false;
    }
  }

  async sendWhatsApp(
    recipients: { phone: string }[],
    message: string,
  ): Promise<boolean> {
    const phones = recipients.map((r) => r.phone).filter(Boolean);
    if (phones.length === 0) {
      this.logger.warn("No phone numbers for WhatsApp");
      return true;
    }

    const accountSid = this.configService.get<string>("TWILIO_ACCOUNT_SID");
    const authToken = this.configService.get<string>("TWILIO_AUTH_TOKEN");

    if (!accountSid || !authToken) {
      this.logger.log(`[WHATSAPP LOG] To: ${phones.join(", ")} | Body: ${message}`);
      return true;
    }

    try {
      const twilioModule = await import("twilio");
      const twilioClient = (twilioModule.default || twilioModule)(accountSid, authToken);

      const from = `whatsapp:${this.configService.get<string>("TWILIO_WHATSAPP_NUMBER")}`;
      const results = await Promise.allSettled(
        phones.map((phone) =>
          twilioClient.messages.create({
            body: message,
            from,
            to: `whatsapp:${phone}`,
          }),
        ),
      );

      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      this.logger.log(`WhatsApp: ${succeeded}/${phones.length} sent`);
      return succeeded > 0;
    } catch (error) {
      this.logger.error("Twilio WhatsApp failed", error);
      return false;
    }
  }
}
