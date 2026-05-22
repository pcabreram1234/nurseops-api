export const WORKLOAD_CACHE_KEYS = {
    NURSE_METRICS: (nurseId: string, month: number, year: number) => `cache:workload:nurse:${nurseId}:${month}:${year}`,
    ORGANIZATION_ANALYTICS: (orgId: string, month: number, year: number) => `cache:workload:org:${orgId}:${month}:${year}`,
};

export const WORKLOAD_EVENTS = {
    BURNOUT_DETECTED: 'workload.burnout.detected',
    FATIGUE_THRESHOLD_REACHED: 'workload.fatigue.reached',
    OVERTIME_LIMIT_REACHED: 'workload.overtime.reached',
    IMBALANCED: 'workload.imbalanced',
};

export const WORKLOAD_SYSTEM_LISTENERS = {
    SHIFT_COMPLETED: 'shift.completed',
    OVERTIME_DETECTED: 'shift.overtime.detected',
    SCHEDULE_PUBLISHED: 'schedule.published',
    EMERGENCY_COVERED: 'emergency.covered',
};

export const WORKLOAD_THRESHOLDS = {
    MAX_OVERTIME_HOURS_MONTHLY: 40,
    FATIGUE_CRITICAL_SCORE: 85,
    BURNOUT_RISK_HIGH_SCORE: 75,
    FAIRNESS_MINIMUM_SCORE: 60,
};