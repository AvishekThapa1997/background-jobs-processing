export const appConstants = {
  MAX_RETRY_ATTEMPTS: 'MAX_RETRY_ATTEMPTS',
  DEFAULT_MAX_RETRY_ATTEMPTS: '3',
  ENVIRONMENT: {
    REDIS_PORT: 'REDIS_PORT',
    REDIS_HOST: 'REDIS_HOST',
    REDIS_PASSWORD: 'REDIS_PASSWORD',
  },
  QUEUE_NAME: {
    SEND_EMAIL: 'send_email',
    SEND_SMS: 'send_sms',
  } as const,
};
