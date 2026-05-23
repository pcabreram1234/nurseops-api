import { ScheduleSlot } from "../interfaces/schedule-slot-interface";
import { ScheduleContext } from "../interfaces/shedule-context-interface";
import { NurseStateTracker } from "@modules/nurses/interfaces/nurse-state-tracker-interface";

export function calculateOptimizationScore(
    nurse: any, slot: ScheduleSlot, shiftInfo: any, state: NurseStateTracker, context: ScheduleContext
): number {
    let score = 100; // Puntaje base

    // 1. Equidad (Fairness) - Sistema robin hood: dar turnos a quien tiene menos horas
    // Restamos las horas que ya tiene asignadas para penalizar a los que tienen mucho trabajo
    score -= (state.assignedHours * 2);

    // 2. Preferencias
    // Buscar si en `context.blocks.availabilities` hay una preferencia para este día
    const todayPref = context.blocks.availabilities.find(a =>
        a.nurseId === nurse.id && a.date.getTime() === slot.date.getTime()
    );
    if (todayPref) {
        if (todayPref.shiftPreference === shiftInfo.name) score += 50; // Gran bono si coincide
        if (todayPref.status === 'NOT_AVAILABLE') score -= 200; // Gran penalidad si no quería trabajar, pero si no es restricción dura, se puede forzar en crisis
    }

    // 3. Distribución Mensual (Regla de Noches)
    if (shiftInfo.isNightShift) {
        const depConfig = context.settings.department;
        if (state.assignedNights >= depConfig.max_nights) {
            score -= 1000; // Casi descartado si supera el límite de noches recomendadas
        } else {
            // Bono si tiene 0 noches, para balancear
            score += ((depConfig.max_nights - state.assignedNights) * 10);
        }
    }

    // 4. Penalización por Riesgo (Fatiga del mes anterior)
    const prevMetrics = context.previousMetrics.find(m => m.nurseId === nurse.id);
    if (prevMetrics && prevMetrics.burnoutRisk > 0.8) {
        score -= 40; // Penalización por traer fatiga acumulada
    }

    return score;
}