import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';
import { ModuleDiscoveryService } from './module-discovery.service';
import { ModuleCodeValidator } from '../validators/module-code.validator';

@Injectable()
export class ModuleRegistryService {
    private readonly logger = new Logger(ModuleRegistryService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly discovery: ModuleDiscoveryService,
        private readonly codeValidator: ModuleCodeValidator,
    ) { }

    async autoRegisterDiscoveredModules(): Promise<void> {
        const manifests = await this.discovery.discoverLocalManifests();

        for (const manifest of manifests) {
            const existing = await this.prisma.module.findUnique({ where: { code: manifest.code } });
            if (!existing) {
                await this.prisma.module.create({
                    data: {
                        code: manifest.code.toUpperCase(),
                        name: manifest.name,
                        description: manifest.description,
                        category: manifest.category,
                        version: manifest.version,
                        isCore: manifest.isCore,
                        isSystem: manifest.isSystem,
                        isActive: true,
                    },
                });
                this.logger.log(`[AUTOREGISTRO]: Module '${manifest.code}' dynamically registered.`);
            }
        }
    }
}