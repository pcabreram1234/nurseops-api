export const OPTIMIZATION_EVENTS = {
    STARTED: 'optimization.started',
    FINISHED: 'optimization.finished',
    FAILED: 'optimization.failed',
    CONFLICT_DETECTED: 'optimization.conflict.detected',
};

export const SYSTEM_LISTENERS = {
    SCHEDULE_CREATED: 'schedule.created',
};

export const ENGINE_CONFIG = {
    MAX_EXECUTION_TIME_MS: 45 * 1000, // 45 segundos límite para resolver la matriz distributiva
    MIN_ACCEPTABLE_SCORE: 70.0,
};