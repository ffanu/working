// API Configuration
const isLocalDevelopment = typeof window !== 'undefined' 
  ? window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  : process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined;

export const API_CONFIG = {
  BASE_URL: isLocalDevelopment 
    ? 'http://localhost:5236/api' 
    : (process.env.NEXT_PUBLIC_API_URL || 'https://inventory.appzone.info/api'),
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
  },
  ENDPOINTS: {
    PRODUCTS: '/products',
    CUSTOMERS: '/customers',
    SUPPLIERS: '/suppliers',
    SALES: '/sales',
    PURCHASES: '/purchases',
    USERS: '/users',
    STOCK_MOVEMENTS: '/stockmovements',
    EXPORT: '/export',
    BACKUP: '/backup',
  }
};


// Environment detection
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
