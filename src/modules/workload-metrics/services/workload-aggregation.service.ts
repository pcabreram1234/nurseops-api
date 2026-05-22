import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';
import { WorkloadCalculationService } from './workload-calculation.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class WorkloadAggregationService {
    private readonly logger = new Logger(WorkloadAggregationService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly calculationService: WorkloadCalculationService,
    ) { }

    async aggregateNurseMonthlyMetrics(nurseId: string, orgId: string, month: number, year: number) {
        this.logger.log(`Consolidating nurse transactional hours ${nurseId} for cycle ${month}/${year}`);

        // Nota: Aquí se consultaría tu tabla de 'ScheduleEntry' o marcajes reales consolidados.
        // Simulamos un conteo sumatorio base para acoplarlo con tu tabla de métricas.
        const mockHours = {
            total: 168,
            overtime: 12,
            night: 32,
            weekend: 24,
            teamAverageTotal: 160
        };

        const scores = this.calculationService.calculateMetrics(mockHours);

        return this.prisma.workLoadMetrics.create({
            data: {
                organizationId: orgId,
                nurseId: nurseId,
                month: month,
                year: year,
                total_hours: new Prisma.Decimal(mockHours.total),
                overtime_hours: new Prisma.Decimal(mockHours.overtime),
                regular_hours: new Prisma.Decimal(mockHours.total - mockHours.overtime),
                nigth_hours: new Prisma.Decimal(mockHours.night),
                weekend_hours: new Prisma.Decimal(mockHours.weekend),
                holidy_hours: new Prisma.Decimal(0),
                emergency_hours: new Prisma.Decimal(0),
                fatigue_score: new Prisma.Decimal(scores.fatigueScore),
                fairness_score: new Prisma.Decimal(scores.fairnessScore),
                workload_score: new Prisma.Decimal(scores.workloadScore),
                burnout_risk: new Prisma.Decimal(scores.burnoutRisk),
            },
        });
    }
}