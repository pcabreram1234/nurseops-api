/**
 * Claves globales de caché para optimizar el rendimiento del catálogo de módulos.
 */
export const MODULES_CACHE_KEYS = {
    ALL_MODULES: 'cache:modules:all',
    ACTIVE_MODULES: 'cache:modules:active',
    MODULE_BY_CODE: (code: string) => `cache:modules:code:${code.toUpperCase()}`,
};

/**
 * Eventos del bus interno (EventEmitter2) emitidos por el ciclo de vida de los módulos.
 */
export const MODULE_EVENTS = {
    CREATED: 'module.created',
    UPDATED: 'module.updated',
    DISABLED: 'module.disabled',
    STATUS_CHANGED: 'module.status.changed',
};

/**
 * Restricciones estructurales y límites de rendimiento por defecto para los chequeos de salud.
 */
export const MODULE_HEALTH_LIMITS = {
    /** Tiempo de respuesta en milisegundos para considerar un módulo como DEGRADED */
    LATENCY_DEGRADED_MS: 400,
    /** Tiempo de respuesta máximo tolerado antes de marcar un módulo como CRITICAL o TIMEOUT */
    LATENCY_CRITICAL_MS: 1500,
};

/**
 * Códigos internos del sistema que están blindados contra desactivaciones o eliminaciones.
 */
export const CORE_SYSTEM_MODULE_CODES = [
    'AUTH',
    'ORGANIZATIONS',
    'USERS',
    'MODULES', // El propio gestor no puede apagarse a sí mismo
];