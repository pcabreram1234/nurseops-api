import { getRuntimeValue } from "./context-extractor";
import { OperatorEngine } from "./operator-engine";
import { ScheduleSlot } from "../interfaces/schedule-slot-interface";
import { ScheduleContext } from "../interfaces/shedule-context-interface";
import { WorkRuleActions } from "@prisma/client";
import { Logger } from "@nestjs/common";
// rule-engine/evaluators.ts
export function evaluateHardRule(rule: any, nurse: any, slot: ScheduleSlot, state: any, context: ScheduleContext): { isValid: boolean, reason?: string } {

    let isConditionTriggered = false;

    // 1. Evaluar todas las condiciones de la regla (Ej: Horas > 160)
    for (const condition of rule.workRuleConditions) {
        if (!condition.enabled) continue;

        const actualValue = getRuntimeValue(condition, nurse, slot, state, context);
        const evaluateFunc = OperatorEngine[condition.operator];

        if (!evaluateFunc) {
            Logger.error(`[Rule Engine] Operador no reconocido: ${condition.operator}`);
            isConditionTriggered = false; // O lanza un error para detener el motor
            break;
        }

        // console.log("El valor actual es: " + actualValue)
        // console.log("EL operator a evaluar es: " + evaluateFunc)

        // Ejecuta la comparación matemática
        if (evaluateFunc && evaluateFunc(actualValue, condition.value)) {
            isConditionTriggered = true;
        } else {
            // Si las condiciones son de tipo "AND", al fallar una, la regla no se dispara
            isConditionTriggered = false;
            break;
        }
    }

    // 2. Si la condición se cumplió, aplicamos la Acción
    if (isConditionTriggered) {
        const action = rule.workRuleActions.find((a: WorkRuleActions) => a.enabled === true && a.action_type === 'REJECT_NURSE');
        if (action) {
            console.log(`❌ Enfermera rechazada. Regla que falló: ${rule.name}. Razón: ${action.action_value}`);
            return { isValid: false, reason: action.action_value }; // Ej: "Excede máximo de horas"
        }
    }

    return { isValid: true };
}

export function evaluateSoftRule(rule: any, nurse: any, slot: any, state: any, context: any): number {
    let scoreModifier = 0;
    let isConditionTriggered = true; // Asumimos AND para múltiples condiciones

    for (const condition of rule.workRuleConditions) {
        if (!condition.enabled) continue;
        const actualValue = getRuntimeValue(condition.condition_type, nurse, slot, state, context);
        const evaluateFunc = OperatorEngine[condition.operator];

        if (!evaluateFunc || !evaluateFunc(actualValue, condition.value)) {
            isConditionTriggered = false;
            break;
        }
    }

    if (isConditionTriggered) {
        for (const action of rule.workRuleActions) {
            if (!action.enabled) continue;

            if (action.action_type === 'DECREASE_SCORE') {
                scoreModifier -= Number(action.action_value); // Ej: Resta 15
            } else if (action.action_type === 'INCREASE_SCORE') {
                scoreModifier += Number(action.action_value); // Ej: Suma 20
            }
        }
    }

    return scoreModifier;
}


/**
 * Evalúa si una regla de tipo EVENT debe dispararse basándose en el estado final del horario.
 * @param rule La regla de evento extraída de la base de datos.
 * @param slots El arreglo final de turnos (asignados y no asignados).
 * @param conflictReport El reporte generado en la Fase 5 del motor.
 * @returns boolean - true si el evento debe dispararse, false en caso contrario.
 */
export function evaluateEventRule(rule: any, slots: any[], conflictReport: any): boolean {
    let isConditionTriggered = true; // Asumimos lógica AND: todas las condiciones deben cumplirse

    // Si la regla no tiene condiciones, no se dispara (o podrías decidir que siempre se dispare)
    if (!rule.workRuleConditions || rule.workRuleConditions.length === 0) {
        return false;
    }

    for (const condition of rule.workRuleConditions) {
        if (!condition.enabled) continue;

        // 1. Extraer el valor actual del estado global del horario
        const actualValue = getEventRuntimeValue(condition.condition_type, slots, conflictReport);

        // 2. Obtener la función matemática del operador (EQUALS, GREATER_THAN, etc.)
        const evaluateFunc = OperatorEngine[condition.operator];

        // 3. Ejecutar la comparación
        if (!evaluateFunc || !evaluateFunc(actualValue, condition.value)) {
            isConditionTriggered = false;
            break; // Falla rápido: si una condición no se cumple, el evento no se dispara
        }
    }

    return isConditionTriggered;
}

/**
 * Extractor de variables dinámicas exclusivamente para reglas de EVENTO (Fase 4).
 */
export function getEventRuntimeValue(conditionType: string, slots: any[], conflictReport: any): any {
    switch (conditionType) {
        // Regla comodín: Devuelve 'true' si hubo al menos un turno sin asignar
        case 'EVALUATE_EVENT':
            const hasEmptySlots = slots.some(slot => !slot.assignedNurseId);
            return hasEmptySlots ? 'true' : 'false';

        // Variables analíticas
        case 'UNASSIGNED_SLOTS_COUNT':
            return slots.filter(slot => !slot.assignedNurseId).length;

        case 'CONFLICT_COUNT':
            // Asume que tu conflictReport tiene un arreglo de alertas o un contador
            return conflictReport?.alerts?.length || 0;

        case 'MISSING_REQUIRED_SPECIALITY':
            // Verifica si algún turno sin asignar requería especialidad obligatoria
            const missingSpeciality = slots.some(slot => !slot.assignedNurseId && slot.requiredSpecialityId);
            return missingSpeciality ? 'true' : 'false';

        default:
            console.warn(`[Rule Engine - Event] Variable global no reconocida: ${conditionType}`);
            return null;
    }
}