import { logger } from '../utils/logger.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled Application Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method
  });

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : (process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message);

  ApiResponse.error(res, message, statusCode, err.errors || null);
};

export const notFoundHandler = (req, res) => {
  ApiResponse.error(res, `Route ${req.method} ${req.originalUrl} not found on this server.`, 404);
};
