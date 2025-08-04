/**
 * Environment configuration utility
 * Provides type-safe access to environment variables
 */

const env = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || '',
  
  // App Configuration
  appName: import.meta.env.VITE_APP_NAME || 'CRM Dashboard',
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  
  // Feature Flags
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableDebugTools: import.meta.env.VITE_ENABLE_DEBUG_TOOLS === 'true',
  
  // External Services
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
};

// Log environment in development
if (env.isDevelopment) {
  console.log('Environment:', {
    ...env,
    // Don't log sensitive values in production
    googleMapsApiKey: env.googleMapsApiKey ? '***' : 'Not set',
    sentryDsn: env.sentryDsn ? '***' : 'Not set',
  });
}

export default env;
