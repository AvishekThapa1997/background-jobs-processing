export const APP_CONSTANTS = {
  MAX_RETRY_ATTEMPTS: 'MAX_RETRY_ATTEMPTS',
  DEFAULT_MAX_RETRY_ATTEMPTS: '3',
  ENVIRONMENT: {
    REDIS_PORT: 'REDIS_PORT',
    REDIS_HOST: 'REDIS_HOST',
    REDIS_PASSWORD: 'REDIS_PASSWORD',
    ENABLE_JOB_FAILURE: 'ENABLE_JOB_FAILURE',
  },
  QUEUE_NAME: {
    SEND_EMAIL: 'send_email',
    SEND_SMS: 'send_sms',
  } as const,
  ERROR_MESSAGES: {
    INTERNAL_SERVER_ERROR: 'Internal server error',
    JOB_NOT_FOUND: 'Job not found',
    INVALID_JOB_TYPE: 'Invalid job type',
  } as const,
};
