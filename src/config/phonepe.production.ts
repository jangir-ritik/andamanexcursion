export const phonePeProductionConfig = {
  // Production-specific settings
  isProduction: true,
  
  // Rate limiting for production
  rateLimit: {
    statusChecks: { windowMs: 60000, max: 30 }, // 30 requests per minute
    callbacks: { windowMs: 60000, max: 100 },    // 100 requests per minute
  },
  
  // Logging configuration
  logging: {
    level: 'info', // Use 'debug' only for troubleshooting
    maskSensitiveData: true,
    logToFile: true,
    filePath: '/var/log/phonepe/payments.log',
  },
  
  // Monitoring
  monitoring: {
    enableSentry: true,
    enableNewRelic: true,
    healthCheckEndpoint: '/api/payments/phonepe/health',
  },
  
  // Security
  security: {
    enableIpWhitelisting: true,
    requireHttps: true,
    requestTimeout: 10000, // 10 seconds
  },
};