import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { logger } from '../utils/logger';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
        isActive: boolean;
      };
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header required',
      });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token required',
      });
    }

    // Verify token and get user
    const user = await authService.verifyToken(token);

    // Attach user to request
    req.user = user;

    next();

  } catch (error) {
    logger.error('Authentication failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.path,
      method: req.method,
    });

    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};

/**
 * Middleware to check user roles
 */
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Access denied - insufficient permissions', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path,
      });

      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Middleware to check if user is admin or manager
 */
export const requireManager = requireRole(['admin', 'manager']);

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(' ')[1];

      if (token) {
        const user = await authService.verifyToken(token);
        req.user = user;
      }
    }

    next();

  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Rate limiting for auth endpoints
 */
export const authRateLimit = (req: Request, res: Response, next: NextFunction) => {
  // This is a placeholder - in production, you'd use Redis or similar
  // for distributed rate limiting across multiple server instances
  next();
};

/**
 * Middleware to log user actions for audit trail
 */
export const auditLog = (action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = function(body) {
      // Log after response is sent
      setImmediate(() => {
        if (req.user) {
          logger.info('User action audit', {
            userId: req.user.id,
            email: req.user.email,
            action,
            path: req.path,
            method: req.method,
            statusCode: res.statusCode,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
          });
        }
      });

      return originalSend.call(this, body);
    };

    next();
  };
};