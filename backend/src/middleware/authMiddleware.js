import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ApiResponse.error(res, 'Authentication required. No token provided.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
      return ApiResponse.error(res, 'Access denied. Administrator privileges required.', 403);
    }
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return ApiResponse.error(res, 'Session expired. Please log in again.', 401);
    }
    return ApiResponse.error(res, 'Invalid authentication token.', 401);
  }
};
