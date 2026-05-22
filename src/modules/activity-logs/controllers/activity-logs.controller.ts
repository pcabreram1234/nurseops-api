import { Controller, Get, Post, Body, Query, Sse, UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ActivityLogsService } from '../services/activity-logs.service';
import { ActivityFeedService } from '../services/activity-feed.service';
import { ActivityStreamService } from '../services/activity-stream.service';
import { CreateActivityLogDto } from '../dto/create-activity-log.dto';
import { ActivityLogFilterDto } from '../dto/activity-log-filter.dto';
import { ActivityFeedDto } from '../dto/activity-feed.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@modules/auth/guards/permissions.guard';
import { Permissions } from '@modules/auth/decorators/permissions.decorator';

@Controller({ path: 'activity-logs', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ActivityLogsController {
    constructor(
        private readonly logsService: ActivityLogsService,
        private readonly feedService: ActivityFeedService,
        private readonly streamService: ActivityStreamService,
    ) { }

    @Post()
    @Permissions('WRITE_AUDIT_LOGS')
    create(@Body() dto: CreateActivityLogDto) {
        return this.logsService.create(dto);
    }

    @Get()
    @Permissions('READ_AUDIT_LOGS')
    findAll(@Query() filters: ActivityLogFilterDto) {
        return this.logsService.findAll(filters);
    }

    @Get('feed')
    @Permissions('READ_AUDIT_LOGS')
    getFeed(@Query() query: ActivityFeedDto) {
        return this.feedService.getOperationalFeed(query);
    }

    @Sse('stream')
    @Permissions('READ_AUDIT_LOGS')
    streamActivities(): Observable<{ data: any }> {
        return this.streamService.getLiveStream();
    }
}