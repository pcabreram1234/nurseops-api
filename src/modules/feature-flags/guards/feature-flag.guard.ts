import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FeaturTypes } from '@prisma/client';
import { FeatureFlagEvaluatorService } from '../services/feature-flag-evaluator.service';
import { METADATA_KEYS } from '../constants/feature-flags.constants';
import { FeatureEnvironment } from '../enums/feature-environment.enum';

@Injectable()
export class FeatureFlagGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly evaluator: FeatureFlagEvaluatorService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredFeature = this.reflector.getAllAndOverride<FeaturTypes>(METADATA_KEYS.FEATURE_FLAG, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredFeature) {
            return true;
        }

        const request = context.switchToHttp().getRequest();

        // Evaluamos el estado dinámico de la característica en base al entorno operativo de la app
        const isEnabled = await this.evaluator.isFeatureEnabled(requiredFeature, {
            userId: request.user?.id,
            departmentId: request.user?.departmentId,
            environment: (process.env.NODE_ENV as FeatureEnvironment) || FeatureEnvironment.PRODUCTION,
        });

        if (!isEnabled) {
            throw new ForbiddenException(`The modular functionality [${requiredFeature}] is temporarily turned off for maintenance.`);
        }

        return true;
    }
}