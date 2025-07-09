// Environment utilities
export const env = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000',
  
  // Application Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Calendula',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',
  
  // Helper methods
  isDevelopment: () => import.meta.env.DEV || import.meta.env.VITE_NODE_ENV === 'development',
  isProduction: () => import.meta.env.PROD || import.meta.env.VITE_NODE_ENV === 'production',
}