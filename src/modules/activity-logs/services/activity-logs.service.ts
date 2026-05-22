import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateActivityLogDto } from '../dto/create-activity-log.dto';
import { ActivityLogFilterDto } from '../dto/activity-log-filter.dto';
import { ActivityUserValidator } from '../validators/activity-user.validator';
import { ActivityDetailsValidator } from '../validators/activity-details.validator';
import { ActivityCacheService } from './activity-cache.service';
import { ActivityStreamService } from './activity-stream.service';
import { ACTIVITY_EVENTS } from '../constants/activity-logs.constants';
import { ActivityCreatedEvent } from '../events/activity-created.event';

@Injectable()
export class ActivityLogsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
        private readonly userValidator: ActivityUserValidator,
        private readonly detailsValidator: ActivityDetailsValidator,
        private readonly cache: ActivityCacheService,
        private readonly stream: ActivityStreamService,
    ) { }

    async create(dto: CreateActivityLogDto) {
        await this.userValidator.verifyUserExists(dto.userId);
        this.detailsValidator.validateStructure(dto.details);

        const log = await this.prisma.activityLog.create({
            data: {
                userId: dto.userId,
                action: dto.action,
                details: dto.details,
            },
            include: { user: { select: { firstName: true } } },
        });

        await this.cache.invalidateFeed();
        this.stream.emitLiveActivity(log);

        this.eventEmitter.emit(
            ACTIVITY_EVENTS.CREATED,
            new ActivityCreatedEvent(log.id, log.userId, log.action, 'INFO'),
        );

        return log;
    }

    async findAll(filters: ActivityLogFilterDto) {
        return this.prisma.activityLog.findMany({
            where: {
                ...(filters.userId && { userId: filters.userId }),
                ...(filters.action && { action: filters.action as any }),
                ...((filters.fromDate || filters.toDate) && {
                    createdAt: {
                        ...(filters.fromDate && { gte: new Date(filters.fromDate) }),
                        ...(filters.toDate && { lte: new Date(filters.toDate) }),
                    },
                }),
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}