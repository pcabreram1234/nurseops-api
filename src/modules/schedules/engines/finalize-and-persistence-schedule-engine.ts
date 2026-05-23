import { PrismaService } from '@infra/database/prisma.service';
import { ScheduleSlot } from '../interfaces/schedule-slot-interface';
import { ScheduleEntryStatus } from '@prisma/client';
import { EngineMetrics } from '../interfaces/schedule-engine-metrics';
import { triggerDraftReadyNotification } from '../emitter/schedule_draft_emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';

export async function finalizeAndPersistSchedule(
    prisma: PrismaService,
    departmentId: string,
    organizationId: string,
    targetDate: Date,
    slots: ScheduleSlot[],
    conflictReport: any, // ReturnType de generateConflictReport
    engineStartTime: number, // Timestamp tomado al inicio del orquestador
    triggeredById: string, // Usuario que diparo el proceso
    eventEmitter: EventEmitter2,
    engineMetrics: EngineMetrics,
): Promise<string> {

    // 1. Cálculos Analíticos Previos
    const generationTimeMs = Date.now() - engineStartTime;
    const totalSlots = slots.length;
    const coveredSlots = slots.filter(s => s.assignedNurseId !== null).length;
    const unassignedShifts = totalSlots - coveredSlots;
    const coveragePercentage = totalSlots > 0 ? (coveredSlots / totalSlots) * 100 : 0;


    // Construcción dinámica de las advertencias
    const dynamicWarnings = conflictReport.hasConflicts
        ? conflictReport.alerts.map((alert: any) => alert.message)
        : [];


    console.log(`[Engine] Finishint. Execution time: ${generationTimeMs}ms. Coverage: ${coveragePercentage.toFixed(2)}%`);

    try {
        // Transacción Maestra: Todo se guarda o nada se guarda
        const generatedSchedule = await prisma.$transaction(async (tx) => {

            // ==========================================
            // 1. CREAR CALENDARIO (Schedule)
            // ==========================================
            const newSchedule = await tx.schedule.create({
                data: {
                    departmentId,
                    organizationId,
                    // Suponiendo que guardas mes/año o la fecha base
                    month: targetDate.getMonth() + 1,
                    year: targetDate.getFullYear(),
                    status: 'DRAFT', // Requerimiento exacto: Nace como borrador
                    hasConflicts: conflictReport.hasConflicts,
                    totalConflicts: conflictReport.totalConflicts,
                    generationTimeMs: generationTimeMs,
                }
            });



            // ==========================================
            // 2. GUARDAR ASIGNACIONES (ScheduleEntry)
            // ==========================================
            const entriesToInsert = slots.map(slot => ({
                scheduleId: newSchedule.id,
                shiftId: slot.shiftId,
                date: slot.date,
                nurseId: slot.assignedNurseId as string,
                requiredSpecialityId: slot.requiredSpecialityId,
                status: slot.assignedNurseId ? ScheduleEntryStatus.ASSIGNED : ScheduleEntryStatus.OPEN,
                assignedById: triggeredById,
                organizationId: organizationId
            }));

            await tx.scheduleEntry.createMany({
                data: entriesToInsert,
                skipDuplicates: true
            });

            // (Opcional - Fase 5) Guardar alertas vinculadas a este nuevo calendario
            if (conflictReport.hasConflicts) {
                const alertsToInsert = conflictReport.alerts.map((alert: any) => ({
                    ...alert,
                    scheduleId: newSchedule.id
                }));
                await tx.operationalAlert.createMany({
                    data: alertsToInsert
                });
            }

            // ==========================================
            // 3. GUARDAR EL REGISTRO ANALÍTICO (OptimizationRun)
            // ==========================================
            await tx.optimizationRun.create({
                data: {
                    scheduleId: newSchedule.id,
                    departmentId: departmentId,
                    executionTimeMs: generationTimeMs,
                    totalSlotsProcessed: totalSlots,
                    slotsCovered: coveredSlots,
                    coveragePercentage: coveragePercentage,
                    startedAt: engineStartTime.toString(),
                    fineshedAt: Date.now().toString(),
                    result: {
                        "status": conflictReport.hasConflicts ? "SUCCESS_WITH_WARNINGS" : "SUCCESS",
                        "fairness_score": engineMetrics?.fairnessScore ?? 100, // Por defecto 100 si no se calcula
                        "fatigue_score": engineMetrics?.fatigueScore ?? 0,     // Por defecto 0 si no se calcula
                        "rule_violations": conflictReport.totalConflicts,
                        "unassigned_shifts": unassignedShifts,
                        "optimized_entries": coveredSlots,
                        "warnings": dynamicWarnings
                    }
                    // Si el Filtro B calculó métricas de equidad, podrías promediarlas y guardarlas aquí
                }
            });

            return newSchedule;
        });

        // ==========================================
        // 4. NOTIFICAR (Eventos / Jobs)
        // ==========================================
        triggerDraftReadyNotification(eventEmitter, generatedSchedule.id, departmentId);

        return generatedSchedule.id;

    } catch (error) {
        console.error(`[Engine] ❌ Fatal error during persistence:`, error);
        throw new Error('Programming fails to complete and persists.');
    }
}

