import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';
import { Prisma } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ExecuteOptimizationDto } from '../dto/execute-optimization.dto';
import { OptimizationFilterDto } from '../dto/optimization-filter.dto';
import { OptimizationEngineService } from './optimization-engine.service';
import { OptimizationSnapshotService } from './optimization-snapshot.service';
import { OptimizationPerformanceService } from './optimization-performance.service';
import { OptimizationScoreValidator } from '../validators/optimization-score.validator';
import { OPTIMIZATION_EVENTS } from '../constants/optimization-runs.constants';
import { OptimizationStartedEvent } from '../events/optimization-started.event';
import { OptimizationFinishedEvent } from '../events/optimization-finished.event';

export interface UserOrgContext {
    organizationId?: string;
    role?: string;
}

@Injectable()
export class OptimizationRunsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly engine: OptimizationEngineService,
        private readonly snapshotService: OptimizationSnapshotService,
        private readonly performanceTelemetry: OptimizationPerformanceService,
        private readonly scoreValidator: OptimizationScoreValidator,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    private buildWhere(filters: OptimizationFilterDto, userOrg?: UserOrgContext) {
        const where: any = {
            ...(filters.scheduleId && { scheduleId: filters.scheduleId }),
        };

        // Aislamiento por organización: usuarios no-SUPER solo ven runs de su organización
        if (userOrg && userOrg.role !== 'SUPER') {
            if (userOrg.organizationId) {
                where.organizationId = userOrg.organizationId;
            }
        }

        return where;
    }

    async executeAndRecordRun(dto: ExecuteOptimizationDto, userOrg?: UserOrgContext) {
        const startedAt = new Date();

        // 1. Respaldar estado previo preventivo
        this.snapshotService.createPreOptimizationSnapshot(dto.scheduleId);

        // 2. Despachar evento transaccional de inicio
        this.eventEmitter.emit(
            OPTIMIZATION_EVENTS.STARTED,
            new OptimizationStartedEvent('dynamic-temp-id', dto.scheduleId, dto.strategy),
        );

        // 3. Ejecutar procesamiento matemático pesado
        const calculation = await this.engine.runCombinatorialSolver({
            scheduleId: dto.scheduleId,
            strategy: dto.strategy,
            maxIterations: dto.maxIterations,
            allowOvertime: dto.allowOvertime,
        });

        // 4. Validar calidad de la solución antes de persistirla
        this.scoreValidator.validateResultScore(calculation.finalScore);

        const finishedAt = new Date();

        // 5. Obtener schedule con organizationId, departmentId, month y year
        const schedule = await this.prisma.schedule.findUnique({
            where: { id: dto.scheduleId },
            select: {
                organizationId: true,
                departmentId: true,
                month: true,
                year: true,
            },
        });

        if (!schedule) {
            throw new NotFoundException(`Schedule con id ${dto.scheduleId} no encontrado`);
        }

        // 6. Calcular métricas reales desde BD: totalSlotsProcessed, slotsCovered, coveragePercentage
        const startOfMonth = new Date(schedule.year, schedule.month - 1, 1);
        const endOfMonth = new Date(schedule.year, schedule.month, 0, 23, 59, 59);

        const slots = await this.prisma.scheduleEntry.findMany({
            where: {
                shiftTemplate: { departmentId: schedule.departmentId },
                date: { gte: startOfMonth, lte: endOfMonth },
            },
            select: { nurseId: true },
        });

        const totalSlotsProcessed = slots.length;
        const slotsCovered = slots.filter((s) => s.nurseId !== null).length;
        const coveragePercentage = totalSlotsProcessed > 0
            ? (slotsCovered / totalSlotsProcessed) * 100
            : 0;

        // 7. Derivar organizationId (prioridad: userOrg > schedule)
        const organizationId = userOrg?.organizationId ?? schedule.organizationId;

        // 8. Mapear y persistir en la base de datos con TODOS los campos obligatorios
        const run = await this.prisma.optimizationRun.create({
            data: {
                scheduleId: dto.scheduleId,
                startedAt,
                finishedAt,
                organizationId,
                departmentId: schedule.departmentId,
                executionTimeMs: new Prisma.Decimal(calculation.processingTimeMs),
                totalSlotsProcessed,
                slotsCovered,
                coveragePercentage: new Prisma.Decimal(coveragePercentage),
                result: calculation as unknown as Prisma.JsonObject,
            },
        });

        // 6. Registrar telemetría de rendimiento y despachar evento finalizador
        this.performanceTelemetry.logPerformanceTelemetry(run.id, calculation.processingTimeMs, dto.maxIterations);
        this.eventEmitter.emit(OPTIMIZATION_EVENTS.FINISHED, new OptimizationFinishedEvent(run.id, dto.scheduleId, calculation));

        return run;
    }

    async findAll(filters: OptimizationFilterDto, userOrg?: UserOrgContext) {
        const where = this.buildWhere(filters, userOrg);

        const include = {
            schedule: {
                select: {
                    id: true,
                    month: true,
                    year: true,
                    status: true,
                    department: { select: { id: true, name: true } },
                },
            },
            department: { select: { id: true, name: true } },
        } as const;

        // Paginación opcional: sin page/limit se mantiene el array plano
        // (backward compatible con los consumidores existentes de este service)
        if (filters.page || filters.limit) {
            const page = Math.max(1, filters.page ?? 1);
            const limit = Math.min(500, Math.max(1, filters.limit ?? 25));
            const [data, total] = await Promise.all([
                this.prisma.optimizationRun.findMany({
                    where,
                    include,
                    orderBy: { startedAt: 'desc' },
                    skip: (page - 1) * limit,
                    take: limit,
                }),
                this.prisma.optimizationRun.count({ where }),
            ]);
            return {
                data,
                meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
            };
        }

        return this.prisma.optimizationRun.findMany({ where, include, orderBy: { startedAt: 'desc' } });
    }

    async findOne(id: string, userOrg?: UserOrgContext) {
        const where: any = { id };

        // Aislamiento: usuarios no-SUPER solo pueden acceder a runs de su organización
        if (userOrg && userOrg.role !== 'SUPER') {
            if (userOrg.organizationId) {
                where.organizationId = userOrg.organizationId;
            }
        }

        const record = await this.prisma.optimizationRun.findUnique({
            where,
            include: {
                schedule: {
                    select: {
                        id: true,
                        month: true,
                        year: true,
                        status: true,
                        department: { select: { id: true, name: true } },
                    },
                },
                department: { select: { id: true, name: true } },
            },
        });
        if (!record) throw new NotFoundException('Registro de optimización no encontrado.');
        return record;
    }
}
