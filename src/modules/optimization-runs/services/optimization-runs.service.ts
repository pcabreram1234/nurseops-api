import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';
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

    async executeAndRecordRun(dto: ExecuteOptimizationDto) {
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

        const fineshedAt = new Date();

        // 5. Mapear y persistir en la base de datos respetando 'startedAtd', 'fineshedAt' y 'result' como Json
        const run = await this.prisma.optimizationRun.create({
            data: {
                scheduleId: dto.scheduleId,
                startedAt,
                fineshedAt,
                result: calculation as any,
            },
        });

        // 6. Registrar telemetría de rendimiento y despachar evento finalizador
        this.performanceTelemetry.logPerformanceTelemetry(run.id, calculation.processingTimeMs, dto.maxIterations);
        this.eventEmitter.emit(OPTIMIZATION_EVENTS.FINISHED, new OptimizationFinishedEvent(run.id, dto.scheduleId, calculation));

        return run;
    }

    async findAll(filters: OptimizationFilterDto) {
        return this.prisma.optimizationRun.findMany({
            where: {
                ...(filters.scheduleId && { scheduleId: filters.scheduleId }),
            },
            orderBy: { startedAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const record = await this.prisma.optimizationRun.findUnique({ where: { id } });
        if (!record) throw new NotFoundException('Registro de optimización no encontrado.');
        return record;
    }
}