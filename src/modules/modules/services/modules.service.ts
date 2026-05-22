import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateModuleDto } from '../dto/create-module.dto';
import { UpdateModuleDto } from '../dto/update-module.dto';
import { ModuleFilterDto } from '../dto/module-filter.dto';
import { ModuleCodeValidator } from '../validators/module-code.validator';
import { ModuleNameValidator } from '../validators/module-name.validator';
import { ModuleStateValidator } from '../validators/module-state.validator';
import { ModuleCacheService } from './module-cache.service';
import { MODULE_EVENTS } from '../constants/modules.constants';
import { ModuleCreatedEvent } from '../events/module-created.event';
import { ModuleUpdatedEvent } from '../events/module-updated.event';
import { ModuleDisabledEvent } from '../events/module-disabled.event';

@Injectable()
export class ModulesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cache: ModuleCacheService,
        private readonly eventEmitter: EventEmitter2,
        private readonly codeValidator: ModuleCodeValidator,
        private readonly nameValidator: ModuleNameValidator,
        private readonly stateValidator: ModuleStateValidator,
    ) { }

    async create(dto: CreateModuleDto) {
        await this.codeValidator.validate(dto.code);
        this.nameValidator.validate(dto.name);

        const newModule = await this.prisma.module.create({
            data: { ...dto, code: dto.code.toUpperCase().trim() },
        });

        await this.cache.invalidate();
        this.eventEmitter.emit(MODULE_EVENTS.CREATED, new ModuleCreatedEvent(newModule.id, newModule.code));
        return newModule;
    }

    async findAll(filters: ModuleFilterDto) {
        const cached = await this.cache.getCachedModules();
        if (cached && !filters.category && filters.isActive === undefined) return cached;

        const modules = await this.prisma.module.findMany({
            where: {
                ...(filters.category && { category: filters.category }),
                ...(filters.isActive !== undefined && { isActive: filters.isActive }),
            },
            orderBy: { code: 'asc' },
        });

        if (!filters.category && filters.isActive === undefined) {
            await this.cache.setCachedModules(modules);
        }
        return modules;
    }

    async update(id: string, dto: UpdateModuleDto) {
        const current = await this.prisma.module.findUnique({ where: { id } });
        if (!current) throw new NotFoundException('Module not found');

        if (dto.code) await this.codeValidator.validate(dto.code, id);
        if (dto.name) this.nameValidator.validate(dto.name);
        if (dto.isActive !== undefined) this.stateValidator.validateSystemMutation(current.isSystem, true);

        const updated = await this.prisma.module.update({
            where: { id },
            data: dto,
        });

        await this.cache.invalidate();
        this.eventEmitter.emit(MODULE_EVENTS.UPDATED, new ModuleUpdatedEvent(updated.id, updated.code));

        if (dto.isActive === false) {
            this.eventEmitter.emit(MODULE_EVENTS.DISABLED, new ModuleDisabledEvent(updated.id, updated.code));
        }

        return updated;
    }
}