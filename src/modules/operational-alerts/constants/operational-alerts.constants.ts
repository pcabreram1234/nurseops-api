export const ALERT_EVENTS = {
    CREATED: 'operational.alert.created',
    RESOLVED: 'operational.alert.resolved',
    ESCALATED: 'operational.alert.escalated',
    CRITICAL: 'operational.alert.critical',
};

export const ALERT_SYSTEM_LISTENERS = {
    SCHEDULE_PUBLISHED: 'schedule.published',
    OVERTIME_DETECTED: 'shift.overtime.detected',
    EMERGENCY_COVERAGE_FAILED: 'emergency.coverage.failed',
    STAFFING_SHORTAGE: 'staffing.shortage',
    BURNOUT_DETECTED: 'workload.burnout.detected',
};

export const ALERT_MAX_UNRESOLVED_TIME_MS = 30 * 60 * 1000; // 30 minutos antes del autoescalado