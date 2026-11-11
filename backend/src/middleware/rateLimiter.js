import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    timestamp: new Date().toISOString()
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 login attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
    timestamp: new Date().toISOString()
  }
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // 50 document uploads per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Upload rate limit reached. Please wait before uploading more documents.',
    timestamp: new Date().toISOString()
  }
});
