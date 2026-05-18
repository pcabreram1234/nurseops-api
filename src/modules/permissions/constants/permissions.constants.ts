export const PERMISSIONS = {
  USERS: {
    CREATE: 'CREATE_USER',
    READ: 'READ_USER',
    UPDATE: 'UPDATE_USER',
    DELETE: 'DELETE_USER',
  },
  ROLES: {
    MANAGE: 'MANAGE_ROLES', // Crear, editar roles y asignar permisos (Solo Admin/Super)
  },
  ORGANIZATIONS: {
    MANAGE: 'MANAGE_ORGANIZATION', // Ajustes globales de límites de horas, etc.
  },
  DEPARTMENTS: {
    CREATE: 'CREATE_DEPARTMENT',
    READ: 'READ_DEPARTMENT',
    UPDATE: 'UPDATE_DEPARTMENT',
    DELETE: 'DELETE_DEPARTMENT',
  },
  SCHEDULES: {
    CREATE: 'CREATE_SCHEDULE',   // Diseñar o armar el borrador del cronograma
    READ: 'READ_SCHEDULE',       // Ver los turnos del departamento
    UPDATE: 'UPDATE_SCHEDULE',   // Modificar un turno asignado
    APPROVE: 'APPROVE_SCHEDULE', // Firmar/Aprobar el cronograma del mes (Supervisor/Jefe)
    SWAP_REQUEST: 'REQUEST_SHIFT_SWAP', // Pedir un cambio de turno entre compañeros
    SWAP_APPROVE: 'APPROVE_SHIFT_SWAP', // Aprobar el cambio de turno solicitado
  },
  LEAVES: { // Licencias, vacaciones, bajas médicas
    REQUEST: 'REQUEST_LEAVE',   // Solicitar vacaciones o reportar enfermedad
    READ: 'READ_LEAVES',       // Ver solicitudes del departamento
    APPROVE: 'APPROVE_LEAVE',   // Aprobar o denegar la baja/licencia (Supervisor/RRHH)
  },
  ANALYTICS: {
    READ_REPORTS: 'READ_ANALYTICS_REPORTS', // Ver reportes de horas extra y costos
    READ_FATIGUE: 'READ_FATIGUE_ANALYSIS',  // Ver alertas de riesgo de fatiga física
  },
  AUDIT: {
    READ_LOGS: 'READ_AUDIT_LOGS', // Ver el historial de modificaciones del sistema
  }
};