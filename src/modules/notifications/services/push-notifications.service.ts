import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PushNotificationsService {
  private readonly logger = new Logger(PushNotificationsService.name);
  private fcmInitialized = false;

  constructor(private readonly configService: ConfigService) {}

  async sendPushNotification(
    recipients: { pushTokens: string[] }[],
    title: string,
    message: string,
    data?: Record<string, string>,
  ): Promise<boolean> {
    const tokens = recipients.flatMap((r) => r.pushTokens).filter(Boolean);
    if (tokens.length === 0) {
      this.logger.warn("No push tokens available");
      return true;
    }

    const provider = this.configService.get<string>("PUSH_PROVIDER");

    try {
      switch (provider) {
        case "fcm":
          return await this.sendFcm(tokens, title, message, data);
        case "expo":
          return await this.sendExpo(tokens, title, message, data);
        default:
          this.logger.log(`[PUSH LOG] To: ${tokens.length} devices | Title: ${title} | Body: ${message}`);
          return true;
      }
    } catch (error) {
      this.logger.error("Failed to send push notification", error);
      return false;
    }
  }

  private async sendFcm(
    tokens: string[],
    title: string,
    message: string,
    data?: Record<string, string>,
  ): Promise<boolean> {
    await this.initFcm();

    try {
      const admin = await import("firebase-admin");
      const fb = this.getFirebaseApp(admin);

      const result = await fb.messaging().sendEachForMulticast({
        tokens,
        notification: { title, body: message },
        data: data as Record<string, string> | undefined,
      });

      this.logger.log(`FCM: ${result.successCount} sent, ${result.failureCount} failed`);
      return result.failureCount < tokens.length;
    } catch (error) {
      this.logger.error("FCM push failed", error);
      return false;
    }
  }

  private async initFcm() {
    if (this.fcmInitialized) return;

    const serviceAccountPath = this.configService.get<string>("FCM_SERVICE_ACCOUNT_PATH");
    const projectId = this.configService.get<string>("FCM_PROJECT_ID");

    if (!serviceAccountPath && !projectId) {
      this.logger.warn("FCM not configured (FCM_SERVICE_ACCOUNT_PATH or FCM_PROJECT_ID required)");
      return;
    }

    try {
      const admin = await import("firebase-admin");
      const fb = this.getFirebaseApp(admin);

      if (!fb.apps.length) {
        if (serviceAccountPath) {
          const serviceAccount = await import(serviceAccountPath);
          fb.initializeApp({ credential: fb.credential.cert(serviceAccount) });
        } else {
          fb.initializeApp({ projectId });
        }
      }

      this.fcmInitialized = true;
      this.logger.log("Firebase initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize Firebase", error);
    }
  }

  private getFirebaseApp(admin: any) {
    return admin.default || admin;
  }

  private async sendExpo(
    tokens: string[],
    title: string,
    message: string,
    data?: Record<string, string>,
  ): Promise<boolean> {
    try {
      const expoModule = await import("expo-server-sdk");
      const Expo = expoModule.default || expoModule.Expo;
      const expo = new Expo();

      const messages = tokens
        .filter((t: string) => Expo.isExpoPushToken(t))
        .map((t: string) => ({
          to: t,
          title,
          body: message,
          data,
        }));

      if (messages.length === 0) return true;

      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        await expo.sendPushNotificationsAsync(chunk);
      }

      this.logger.log(`Expo push sent to ${messages.length} devices`);
      return true;
    } catch (error) {
      this.logger.error("Expo push failed", error);
      return false;
    }
  }
}
