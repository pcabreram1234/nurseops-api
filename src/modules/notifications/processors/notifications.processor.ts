import { Processor, WorkerHost } from "@nestjs/bullmq";

import { Job } from "bullmq";

@Processor("notifications")
export class NotificationsProcessor extends WorkerHost {
  async process(job: Job<any>): Promise<any> {
    switch (job.name) {
      case "schedule-published":
        return this.handleSchedulePublished(job.data);

      default:
        console.log("Unknown notification job");
    }
  }

  /*
  |--------------------------------------------------------------------------
  | SCHEDULE PUBLISHED
  |--------------------------------------------------------------------------
  */

  async handleSchedulePublished(data: any) {
    console.log("Schedule published notification", data);

    /*
    |--------------------------------------------------------------------------
    | TODO:
    |--------------------------------------------------------------------------
    |
    | send emails
    | send push
    | send sms
    |
    */
  }
}
