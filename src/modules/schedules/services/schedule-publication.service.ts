import { Injectable } from "@nestjs/common";

import { PrismaService } from "@infra/database/prisma.service";

import { EventEmitter2 } from "@nestjs/event-emitter";

import { InjectQueue } from "@nestjs/bullmq";

import { Queue } from "bullmq";

import { ScheduleStatus } from "@prisma/client";

import { ScheduleValidationService } from "./schedule-validation.service";

import { ScheduleVersionService } from "./schedule-version.service";

@Injectable()
export class SchedulePublicationService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly validationService: ScheduleValidationService,

    private readonly versionService: ScheduleVersionService,

    private readonly eventEmitter: EventEmitter2,

    @InjectQueue("notifications")
    private readonly notificationsQueue: Queue,
  ) {}

  async publish(id: string, dto: any, user: any) {
    /*
    |--------------------------------------------------------------------------
    | VALIDATE
    |--------------------------------------------------------------------------
    */

    if (dto.validateBeforePublish) {
      await this.validationService.validateSchedule(id);
    }

    /*
    |--------------------------------------------------------------------------
    | SNAPSHOT
    |--------------------------------------------------------------------------
    */

    if (dto.createVersionSnapshot) {
      await this.versionService.createSnapshot(id);
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */

    const publishedSchedule = await this.prisma.schedule.update({
      where: {
        id,
      },

      data: {
        status: ScheduleStatus.PUBLISHED,

        publishedAt: new Date(),

        publishedById: user.sub,
      },
    });

    /*
    |--------------------------------------------------------------------------
    | QUEUE
    |--------------------------------------------------------------------------
    */

    if (dto.notifyStaff) {
      await this.notificationsQueue.add("schedule-published", {
        scheduleId: id,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | EVENTS
    |--------------------------------------------------------------------------
    */

    this.eventEmitter.emit("schedule.published", {
      scheduleId: id,
    });

    return publishedSchedule;
  }
}
