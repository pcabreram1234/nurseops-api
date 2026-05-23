import { PrismaService } from "@infra/database/prisma.service";
import { buildScheduleContext } from "./build-schedule-context-engine";
import { buildDemandGrid } from "./build-demand-grid-engine";
import { runAssignmentLoop } from "./run-assigment-engine-loop";
import { generateConflictReport } from "./generate-conflict-reporte-engine";
import { finalizeAndPersistSchedule } from "./finalize-and-persistence-schedule-engine";
import { ShiftTemplate } from "@prisma/client";
import { DepartmentSpeciality } from "@prisma/client";
import { EventEmitter2 } from "@nestjs/event-emitter";

export async function runScheduleEngine(
    prisma: PrismaService,
    organizationId: string,
    departmentId: string,
    targetDate: Date,
    shiftTemplates: ShiftTemplate[],
    specialities: DepartmentSpeciality[],
    triggeredById: string
) {
    // ⏱️ Iniciar el cronómetro
    const engineStartTime = Date.now();

    try {
        // Fase 1: Cargar el Mundo en RAM
        const context = await buildScheduleContext(organizationId, departmentId, targetDate, prisma);

        // Fase 2: Dibujar el Tablero Vacío
        const emptySlots = buildDemandGrid(targetDate, shiftTemplates, specialities);

        // Fase 3 y 4: Asignación y Actualización en Memoria
        const assignedSlots = runAssignmentLoop(emptySlots, context, shiftTemplates);

        // Fase 5: Manejo de Excepciones y Conflictos
        const conflictReport = generateConflictReport(assignedSlots.slots, shiftTemplates, emptySlots[0].id, departmentId);
        const emitter = new EventEmitter2()

        // Fase 6: Persistencia, Analíticas y Notificaciones
        const newScheduleId = await finalizeAndPersistSchedule(
            prisma,
            departmentId,
            organizationId,
            targetDate,
            assignedSlots.slots,
            conflictReport,
            engineStartTime,
            triggeredById, emitter, assignedSlots.metrics
        );

        return { success: true, scheduleId: newScheduleId };

    } catch (error) {
        console.error("[Schedule Engine] Falló la generación:", error);
        return { success: false, error: error };
    }
}