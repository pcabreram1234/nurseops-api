export interface NotificationChannelInterface {
    send(
        payload: any,
    ): Promise<boolean>;
}