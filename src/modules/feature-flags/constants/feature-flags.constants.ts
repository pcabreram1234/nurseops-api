export const FEATURE_CACHE_KEYS = {
    ALL_FLAGS: 'cache:feature_flags:all',
    FLAG_STATUS: (name: string) => `cache:feature_flags:status:${name}`,
};

export const FEATURE_EVENTS = {
    ENABLED: 'feature.enabled',
    DISABLED: 'feature.disabled',
    ROLLOUT_STARTED: 'feature.rollout.started',
};

export const METADATA_KEYS = {
    FEATURE_FLAG: 'feature_flag_key',
};