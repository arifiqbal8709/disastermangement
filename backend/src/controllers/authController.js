import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { loginSchema } from '../validators/schemas.js';
import { AuditService } from '../services/auditService.js';

export const AuthController = {
  login: async (req, res, next) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponse.error(res, 'Validation failed', 400, parsed.error.format());
      }

      const { email, password } = parsed.data;

      // Verify configured administrator credentials
      const adminEmail = config.admin.email;
      const adminPass = config.admin.password;

      const isEmailMatch = email.toLowerCase() === adminEmail.toLowerCase();
      const isPasswordMatch = password === adminPass;

      if (!isEmailMatch || !isPasswordMatch) {
        await AuditService.log({
          userEmail: email,
          action: 'LOGIN_FAILED',
          resourceType: 'AUTH',
          ipAddress: req.ip,
          details: { reason: 'Invalid email or password' }
        });
        return ApiResponse.error(res, 'Invalid administrator credentials. Access unauthorized.', 401);
      }

      const tokenPayload = {
        id: 'admin-001',
        email: adminEmail,
        role: 'super_admin',
        fullName: 'National Disaster Intelligence Officer',
        department: 'State Disaster Management Authority'
      };

      const token = jwt.sign(tokenPayload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn
      });

      await AuditService.log({
        userEmail: adminEmail,
        action: 'ADMIN_LOGIN_SUCCESS',
        resourceType: 'AUTH',
        ipAddress: req.ip,
        details: { role: 'super_admin' }
      });

      return ApiResponse.success(res, {
        token,
        user: tokenPayload,
        expiresIn: config.jwt.expiresIn
      }, 'Administrator authenticated successfully.');
    } catch (err) {
      next(err);
    }
  },

  verifySession: async (req, res) => {
    // req.user populated by requireAdminAuth middleware
    return ApiResponse.success(res, {
      user: req.user,
      isValid: true
    }, 'Session active and verified.');
  },

  logout: async (req, res) => {
    if (req.user) {
      await AuditService.log({
        userEmail: req.user.email,
        action: 'ADMIN_LOGOUT',
        resourceType: 'AUTH',
        ipAddress: req.ip
      });
    }
    return ApiResponse.success(res, null, 'Logged out successfully.');
  },

  register: async (req, res) => {
    // Disabled public registration per security requirements
    return ApiResponse.error(res, 'Public registration is disabled. Only the designated administrator can access the platform.', 403);
  }
};

