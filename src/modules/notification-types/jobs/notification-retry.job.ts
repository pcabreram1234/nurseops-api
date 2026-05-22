import { Processor } from "@nestjs/bullmq";

@Processor("notification-retry",)
export class NotificationRetryJob { }