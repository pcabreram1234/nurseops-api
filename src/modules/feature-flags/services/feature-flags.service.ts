import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateFeatureFlagDto } from '../dto/create-feature-flag.dto';
import { FeatureFlagFilterDto } from '../dto/feature-flag-filter.dto';
import { ToggleFeatureFlagDto } from '../dto/toggle-feature-flag.dto';
import { FeatureFlagCacheService } from './feature-flag-cache.service';
import { FeatureAuditService } from './feature-audit.service';
import { FeatureNameValidator } from '../validators/feature-name.validator';
import { FEATURE_EVENTS } from '../constants/feature-flags.constants';
import { FeatureEnabledEvent } from '../events/feature-enabled.event';
import { FeatureDisabledEvent } from '../events/feature-disabled.event';

@Injectable()
export class FeatureFlagsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cache: FeatureFlagCacheService,
        private readonly audit: FeatureAuditService,
        private readonly nameValidator: FeatureNameValidator,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async create(dto: CreateFeatureFlagDto) {
        this.nameValidator.validate(dto.feature_name);

        const flag = await this.prisma.featureFlag.create({
            data: {
                feature_name: dto.feature_name,
                isActive: dto.isActive ?? false,
            },
        });

        await this.cache.setFlagStatus(flag.feature_name, flag.isActive);
        return flag;
    }

    async findAll(filters: FeatureFlagFilterDto) {
        return this.prisma.featureFlag.findMany({
            where: {
                ...(filters.isActive !== undefined && { isActive: filters.isActive }),
            },
            orderBy: { feature_name: 'asc' },
        });
    }

    async toggle(id: string, dto: ToggleFeatureFlagDto, operatorId?: string) {
        const flag = await this.prisma.featureFlag.findUnique({ where: { id } });
        if (!flag) throw new NotFoundException('The requested feature flag does not exist..');

        const updated = await this.prisma.featureFlag.update({
            where: { id },
            data: { isActive: dto.isActive },
        });

        // Sincronizar Caché de lectura inmediata e imprimir logs de cumplimiento
        await this.cache.setFlagStatus(updated.feature_name, updated.isActive);
        this.audit.logStateChange(updated.feature_name, updated.isActive, operatorId);

        // Despachar eventos a los módulos observadores
        if (updated.isActive) {
            this.eventEmitter.emit(FEATURE_EVENTS.ENABLED, new FeatureEnabledEvent(updated.feature_name, operatorId));
        } else {
            this.eventEmitter.emit(FEATURE_EVENTS.DISABLED, new FeatureDisabledEvent(updated.feature_name, operatorId));
        }

        return updated;
    }
}