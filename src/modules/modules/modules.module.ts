import { Module, OnModuleInit } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '@infra/database/prisma.module';

// Controllers & Services
import { ModulesController } from './controllers/modules.controller';
import { ModulesService } from './services/modules.service';
import { ModuleRegistryService } from './services/module-registry.service';
import { ModuleDiscoveryService } from './services/module-discovery.service';
import { ModulePermissionsService } from './services/module-permissions.service';
import { ModuleHealthService } from './services/module-health.service';
import { ModuleCacheService } from './services/module-cache.service';
import { ModuleAnalyticsService } from './services/module-analytics.service';

// Validators
import { ModuleCodeValidator } from './validators/module-code.validator';
import { ModuleNameValidator } from './validators/module-name.validator';
import { ModuleStateValidator } from './validators/module-state.validator';
import { ModuleDependencyValidator } from './validators/module-dependency.validator';

// Listeners
import { ModuleCreatedListener } from './listeners/module-created.listener';
import { ModuleUpdatedListener } from './listeners/module-updated.listener';
import { ModuleDisabledListener } from './listeners/module-disabled.listener';

// Jobs
import { ModuleHealthCheckJob } from './jobs/module-health-check.job';
import { ModuleCacheSyncJob } from './jobs/module-cache-sync.job';

@Module({
    imports: [
        PrismaModule,
        ScheduleModule.forRoot(),
        EventEmitterModule.forRoot(),
    ],
    controllers: [ModulesController],
    providers: [
        ModulesService,
        ModuleRegistryService,
        ModuleDiscoveryService,
        ModulePermissionsService,
        ModuleHealthService,
        ModuleCacheService,
        ModuleAnalyticsService,

        // Validadores estructurales
        ModuleCodeValidator,
        ModuleNameValidator,
        ModuleStateValidator,
        ModuleDependencyValidator,

        // Bus de Eventos asíncronos
        ModuleCreatedListener,
        ModuleUpdatedListener,
        ModuleDisabledListener,

        // Automatizaciones en segundo plano
        ModuleHealthCheckJob,
        ModuleCacheSyncJob,
    ],
    exports: [
        ModulesService,
        ModuleRegistryService,
        ModulePermissionsService,
        ModuleHealthService,
        ModuleCacheService,
    ],
})
export class ModulesModule implements OnModuleInit {
    constructor(private readonly registryService: ModuleRegistryService) { }

    async onModuleInit() {
        // Cuando el sistema arranca, realiza automáticamente el descubrimiento y alta de nuevos módulos clínicos
        await this.registryService.autoRegisterDiscoveredModules();
    }
}