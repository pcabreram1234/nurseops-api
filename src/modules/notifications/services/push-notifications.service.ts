import { Injectable } from "@nestjs/common";

@Injectable()
export class PushNotificationsService {
  async sendPushNotification(
    recipients: string[],

    title: string,

    message: string,
  ) {
    console.log("Push notification sent", {
      recipients,
      title,
      message,
    });

    /*
    |--------------------------------------------------------------------------
    | TODO:
    |--------------------------------------------------------------------------
    |
    | Firebase
    | OneSignal
    | Expo
    |
    */
  }
}
