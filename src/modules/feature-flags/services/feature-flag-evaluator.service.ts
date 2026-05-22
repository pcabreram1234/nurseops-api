import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';
import { FeaturTypes } from '@prisma/client';
import { FeatureContext } from '../interfaces/feature-context.interface';
import { FeatureFlagCacheService } from './feature-flag-cache.service';

@Injectable()
export class FeatureFlagEvaluatorService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cacheService: FeatureFlagCacheService,
    ) { }

    async isFeatureEnabled(featureName: FeaturTypes, context: FeatureContext): Promise<boolean> {
        // 1. Intentar resolver desde caché local para mitigar latencia en llamadas HTTP recurrentes
        const cachedStatus = await this.cacheService.getFlagStatus(featureName);
        if (cachedStatus !== null) {
            return cachedStatus;
        }

        // 2. Consultar Base de Datos si no hay registro de caché activo
        const flag = await this.prisma.featureFlag.findFirst({
            where: { feature_name: featureName },
        });

        if (!flag) return false;

        // Guardar en caché el estado de la bandera obtenido de la base de datos
        await this.cacheService.setFlagStatus(featureName, flag.isActive);

        return flag.isActive;
    }
}