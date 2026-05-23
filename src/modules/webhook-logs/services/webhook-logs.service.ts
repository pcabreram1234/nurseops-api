import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateWebhookLogDto } from '../dto/create-webhook-log.dto';
import { WebhookLogFilterDto } from '../dto/webhook-log-filter.dto';
import { WebhookPayloadValidator } from '../validators/webhook-payload.validator';
import { WebhookSecurityService } from './webhook-security.service';
import { WebhookMonitoringService } from './webhook-monitoring.service';
import { WEBHOOK_EVENTS } from '../constants/webhook-logs.constants';
import { WebhookReceivedEvent } from '../events/webhook-received.event';

@Injectable()
export class WebhookLogsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
        private readonly payloadValidator: WebhookPayloadValidator,
        private readonly securityService: WebhookSecurityService,
        private readonly telemetry: WebhookMonitoringService,
    ) { }

    async create(dto: CreateWebhookLogDto) {
        this.payloadValidator.validateStructure(dto.payload);
        this.securityService.sanitizePayload(dto.payload);

        const log = await this.prisma.webhookLog.create({
            data: {
                integrationId: dto.integrationId,
                payload: dto.payload as any,
                response: dto.response as any,
            },
        });

        this.telemetry.logLatency(log.id, 12);
        this.eventEmitter.emit(WEBHOOK_EVENTS.RECEIVED, new WebhookReceivedEvent(log.integrationId, dto.payload));

        return log;
    }

    async findAll(filters: WebhookLogFilterDto) {
        return this.prisma.webhookLog.findMany({
            where: {
                ...(filters.integrationId && { integrationId: filters.integrationId }),
            },
            orderBy: { id: 'desc' },
        });
    }

    async findOne(id: string) {
        const log = await this.prisma.webhookLog.findUnique({ where: { id } });
        if (!log) throw new NotFoundException('Non-existent webhook log entry.');
        return log;
    }
}