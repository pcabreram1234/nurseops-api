export const WEBHOOK_CACHE_KEYS = {
    LATEST_LOGS: 'cache:webhooks:latest',
    METRICS: 'cache:webhooks:metrics',
};

export const WEBHOOK_EVENTS = {
    RECEIVED: 'webhook.received',
    PROCESSED: 'webhook.processed',
    FAILED: 'webhook.failed',
    RETRIED: 'webhook.retried',
};

export const WEBHOOK_CONFIG = {
    MAX_RETRY_ATTEMPTS: 5,
    MAX_PAYLOAD_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
};