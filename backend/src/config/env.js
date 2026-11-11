import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  jwt: {
    secret: process.env.JWT_SECRET || 'resilience_ai_default_secret_key_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@resilience.gov.in',
    password: process.env.ADMIN_PASSWORD || 'ResilienceAdmin#2026'
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    bucket: process.env.STORAGE_BUCKET || 'disaster-reports'
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  }
};

