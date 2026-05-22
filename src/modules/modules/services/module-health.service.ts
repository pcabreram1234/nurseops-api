import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';
import { ModuleHealthReport } from '../interfaces/module-health.interface';
import { ModuleStatus } from '../enums/module-status.enum';

@Injectable()
export class ModuleHealthService {
    constructor(private readonly prisma: PrismaService) { }

    async checkHealth(code: string): Promise<ModuleHealthReport> {
        const start = Date.now();
        const target = await this.prisma.module.findUnique({ where: { code } });
        const latency = Date.now() - start;

        if (!target) {
            return { moduleCode: code, status: ModuleStatus.CRITICAL, latencyMs: latency, lastChecked: new Date(), issues: ['Module not registered in database'] };
        }

        if (!target.isActive) {
            return { moduleCode: code, status: ModuleStatus.INACTIVE, latencyMs: latency, lastChecked: new Date(), issues: ['Manually deactivated'] };
        }

        return {
            moduleCode: code,
            status: latency > 400 ? ModuleStatus.DEGRADED : ModuleStatus.ACTIVE,
            latencyMs: latency,
            lastChecked: new Date(),
            issues: latency > 400 ? ['High database latency'] : [],
        };
    }
}