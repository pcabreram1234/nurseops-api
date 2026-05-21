import { ApprovalResult } from './approval-result.interface';

/**
 * Representa el registro de auditoría e historial resultante
 * tras evaluar una regla o validador dentro del flujo de aprobación.
 */
export interface RuleEvaluationLog {
  /**
   * El nombre del validador o la regla ejecutada.
   * Ej: 'ApprovalPermissionValidator', 'ApprovalExpirationValidator'
   */
  validator: string;

  /**
   * Indica si la regla se cumplió exitosamente o no.
   */
  valid: boolean;

  /**
   * Mensaje descriptivo o de error devuelto por el validador.
   */
  message?: string;

  /**
   * Datos contextuales adicionales sobre la evaluación de la regla (opcional).
   * Útil para almacenar contadores o límites calculados en tiempo de ejecución.
   */
  metadata?: Record<string, any>;
}