import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { WebhookLogsService } from '../services/webhook-logs.service';
import { WebhookReplayService } from '../services/webhook-replay.service';
import { CreateWebhookLogDto } from '../dto/create-webhook-log.dto';
import { WebhookLogFilterDto } from '../dto/webhook-log-filter.dto';
import { ReplayWebhookDto } from '../dto/replay-webhook.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@modules/auth/guards/permissions.guard';
import { Permissions } from '@modules/auth/decorators/permissions.decorator';
import { Roles } from '@modules/auth/decorators/roles.decorator';

@Controller({ path: 'webhook-logs', version: '1' })
@Roles("SUPER")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WebhookLogsController {
    constructor(
        private readonly logsService: WebhookLogsService,
        private readonly replayService: WebhookReplayService,
    ) { }

    @Post()
    @Permissions('WRITE_WEBHOOK_LOGS')
    create(@Body() dto: CreateWebhookLogDto) {
        return this.logsService.create(dto);
    }

    @Get()
    @Permissions('READ_WEBHOOK_LOGS')
    findAll(@Query() query: WebhookLogFilterDto) {
        return this.logsService.findAll(query);
    }

    @Post('replay')
    @Permissions('MANAGE_WEBHOOKS')
    replay(@Body() dto: ReplayWebhookDto) {
        return this.replayService.replayExecution(dto.webhookLogId);
    }

    @Get(':id')
    @Permissions('READ_WEBHOOK_LOGS')
    findOne(@Param('id') id: string) {
        return this.logsService.findOne(id);
    }
}