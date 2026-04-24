import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError, formatErrorResponse, ErrorLogger } from '../utils/errors';
import { ZodError } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Extend Express Request to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

/**
 * Request ID middleware - adds unique ID to each request
 */
export const addRequestId = (req: Request, res: Response, next: NextFunction) => {
  req.requestId = uuidv4();
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

/**
 * Enhanced error handler with proper logging and formatting
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Generate request ID if not present
  const requestId = req.requestId || uuidv4();

  // Prepare error context for logging
  const errorContext = {
    requestId,
    userId: (req as any).user?.id,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    path: req.path,
    method: req.method,
    query: req.query,
    ...(req.method !== 'GET' && { body: sanitizeRequestBody(req.body) }),
  };

  // Handle different error types
  let appError: AppError;

  if (err instanceof AppError) {
    appError = err;
  } else if (err instanceof ZodError) {
    // Handle Zod validation errors
    appError = new AppError(
      'Validation failed',
      400,
      'VALIDATION_ERROR'
    );

    // Add validation details
    const validationDetails = err.errors.map(error => ({
      field: error.path.join('.'),
      message: error.message,
      value: error.received,
    }));

    ErrorLogger.logError(appError, { ...errorContext, validationDetails });

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: validationDetails,
        timestamp: new Date().toISOString(),
        requestId,
      },
    });
  } else {
    // Handle unexpected errors
    appError = new AppError(
      process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
      500,
      'INTERNAL_ERROR',
      false
    );
  }

  // Log the error
  ErrorLogger.logError(err, errorContext);

  // Format error response
  const includeStack = process.env.NODE_ENV === 'development';
  const errorResponse = formatErrorResponse(appError, requestId, includeStack);

  // Security: Don't leak sensitive information in production
  if (process.env.NODE_ENV === 'production' && !appError.isOperational) {
    errorResponse.error.message = 'Internal server error';
    delete errorResponse.error.details;
  }

  res.status(appError.statusCode || 500).json(errorResponse);
};

/**
 * Not found handler for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    'NOT_FOUND'
  );

  next(error);
};

/**
 * Async error catcher for route handlers
 */
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Sanitize request body for logging (remove sensitive data)
 */
function sanitizeRequestBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credential'];

  const sanitizeRecursive = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(sanitizeRecursive);
    }

    if (obj && typeof obj === 'object') {
      const result = { ...obj };

      Object.keys(result).forEach(key => {
        const lowerKey = key.toLowerCase();
        const isSensitive = sensitiveFields.some(field => lowerKey.includes(field));

        if (isSensitive) {
          result[key] = '[REDACTED]';
        } else if (typeof result[key] === 'object') {
          result[key] = sanitizeRecursive(result[key]);
        }
      });

      return result;
    }

    return obj;
  };

  return sanitizeRecursive(sanitized);
}

/**
 * Global unhandled promise rejection handler
 */
export const setupGlobalErrorHandlers = () => {
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Promise Rejection:', {
      reason: reason?.message || reason,
      stack: reason?.stack,
      promise: promise.toString(),
    });

    // Graceful shutdown
    process.exit(1);
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', {
      message: error.message,
      stack: error.stack,
    });

    // Graceful shutdown
    process.exit(1);
  });
};