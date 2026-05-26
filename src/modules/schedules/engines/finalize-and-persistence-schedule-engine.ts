import { PrismaService } from '@infra/database/prisma.service';
import { ScheduleSlot } from '../interfaces/schedule-slot-interface';
import { ScheduleEntryStatus } from '@prisma/client';
import { EngineMetrics } from '../interfaces/schedule-engine-metrics';
import { triggerDraftReadyNotification } from '../emitter/schedule_draft_emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OperationalAlertyTypes } from '@prisma/client';
import { ShiftType } from '@prisma/client';
import { randomUUID } from 'node:crypto';

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


    console.log(`[Engine] Finishing. Execution time: ${generationTimeMs}ms. Coverage: ${coveragePercentage.toFixed(2)}%`);

    try {
        // Transacción Maestra: Todo se guarda o nada se guarda
        const generatedSchedule = await prisma.$transaction(async (tx) => {

            // 0. LIMPIEZA PREVIA (Idempotencia)
            const month = targetDate.getMonth() + 1;
            const year = targetDate.getFullYear();

            const existingDraft = await tx.schedule.findFirst({
                where: { departmentId, month, year, status: 'DRAFT' }
            });

            if (existingDraft) {
                await tx.schedule.delete({ where: { id: existingDraft.id } });
            }

            // ==========================================
            // 1. CREAR CALENDARIO (Schedule)
            // ==========================================
            const newSchedule = await tx.schedule.create({
                data: {
                    departmentId,
                    organizationId,
                    // Suponiendo que guardas mes/año o la fecha base
                    month: month,
                    year: year,
                    status: 'DRAFT', // Requerimiento exacto: Nace como borrador
                    hasConflicts: conflictReport.hasConflicts,
                    totalConflicts: conflictReport.totalConflicts,
                    generationTimeMs: generationTimeMs,
                }
            });


            // ==========================================
            // 2. PREPARAR Y CREAR SHIFTS ÚNICOS
            // ==========================================
            const shiftInstancesMap = new Map<string, any>();

            // Recorremos los slots para identificar turnos únicos
            slots.forEach(slot => {
                // Generamos una clave única: TemplateID + Fecha (sin hora)
                const dateKey = new Date(slot.date).toISOString().split('T')[0];
                const shiftKey = `${slot.shiftTemplateId}-${dateKey}`;

                if (!shiftInstancesMap.has(shiftKey)) {
                    // Generamos un ID nuevo para esta instancia de turno
                    const shiftInstanceId = randomUUID();

                    shiftInstancesMap.set(shiftKey, {
                        id: shiftInstanceId,
                        organizationId: organizationId,
                        name: slot.shiftTemplateId, // O el nombre del template
                        code: `${slot.shiftTemplateId}-${dateKey.replace(/-/g, '')}`, // Código único
                        type: slot.shiftInfo.type as ShiftType,
                        startTime: new Date(slot.shiftInfo.startTime),
                        endTime: new Date(slot.shiftInfo.endTime),
                        durationHours: slot.shiftInfo.durationHours, // Asegúrate de que esto sea number
                        departmentId: departmentId,
                        isNightShift: slot.shiftInfo.isNightShift,
                        shiftTemplateId: slot.shiftTemplateId
                    });
                }

                // Inyectamos el ID del turno creado para usarlo en la siguiente fase
                (slot as any).generatedShiftId = shiftInstancesMap.get(shiftKey).id;
            });

            // Insertamos solo los turnos únicos
            await tx.shift.createMany({
                data: Array.from(shiftInstancesMap.values())
            });



            // ==========================================
            // 3. GUARDAR ASIGNACIONES (ScheduleEntry)
            // ==========================================
            const entriesToInsert = slots.map(slot => ({
                scheduleId: newSchedule.id,
                shiftId: (slot as any).generatedShiftId, // Usamos el ID del turno agrupado
                shiftTemplateId: slot.shiftTemplateId,
                date: slot.date,
                nurseId: slot.assignedNurseId as string,
                status: slot.assignedNurseId ? ScheduleEntryStatus.ASSIGNED : ScheduleEntryStatus.OPEN,
                assignedById: triggeredById,
                organizationId: organizationId
            }));

            await tx.scheduleEntry.createMany({
                data: entriesToInsert,
                skipDuplicates: true
            });

            // FASE 4. GUARDAR ALERTAS
            if (conflictReport.hasConflicts && conflictReport.alerts) {
                const alertsToInsert = conflictReport.alerts.map((alert: any) => ({
                    departmentId: departmentId,
                    message: alert.message,
                    severity: alert.severity || "HIGH",
                    // Aquí estaba el error: alert.type debe asignarse a alertType
                    alertType: OperationalAlertyTypes.STAFF_SHORTAGE
                }));

                await tx.operationalAlert.createMany({
                    data: alertsToInsert
                });
            }

            // ==========================================
            // 5. GUARDAR EL REGISTRO ANALÍTICO (OptimizationRun)
            // ==========================================
            await tx.optimizationRun.create({
                data: {
                    scheduleId: newSchedule.id,
                    departmentId: departmentId,
                    executionTimeMs: generationTimeMs,
                    totalSlotsProcessed: totalSlots,
                    slotsCovered: coveredSlots,
                    coveragePercentage: coveragePercentage,
                    startedAt: new Date(engineStartTime),
                    fineshedAt: new Date(Date.now()),
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
        // 6. NOTIFICAR (Eventos / Jobs)
        // ==========================================
        triggerDraftReadyNotification(eventEmitter, generatedSchedule.id, departmentId);

        return generatedSchedule.id;

    } catch (error) {
        console.error(`[Engine] ❌ Fatal error during persistence:`, error);
        throw new Error('Programming fails to complete and persists.');
    }
}

