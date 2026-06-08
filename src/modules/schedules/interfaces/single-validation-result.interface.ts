export interface SingleValidationResult {
  canAssign: boolean;         // Si es false, el frontend bloquea el botón "Guardar"
  errors: string[];           // Violaciones críticas (Vacaciones, Licencias, Reglas HARD)
  warnings: string[];         // Advertencias de optimización o riesgo (Reglas SOFT)
}