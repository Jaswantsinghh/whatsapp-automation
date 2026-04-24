/**
 * Custom error classes for better error handling and logging
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode: string;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorCode = errorCode;

    Error.captureStackTrace(this);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(
      field ? `Validation error in ${field}: ${message}` : message,
      400,
      'VALIDATION_ERROR'
    );
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

export class ExternalAPIError extends AppError {
  constructor(service: string, message?: string) {
    super(
      message ? `${service} API error: ${message}` : `${service} API error`,
      502,
      'EXTERNAL_API_ERROR'
    );
  }
}

export class DatabaseError extends AppError {
  constructor(operation: string, details?: string) {
    super(
      details ? `Database ${operation} failed: ${details}` : `Database ${operation} failed`,
      500,
      'DATABASE_ERROR'
    );
  }
}

export class WhatsAppAPIError extends ExternalAPIError {
  constructor(message?: string) {
    super('WhatsApp', message);
    this.errorCode = 'WHATSAPP_API_ERROR';
  }
}

export class OpenAIError extends ExternalAPIError {
  constructor(message?: string) {
    super('OpenAI', message);
    this.errorCode = 'OPENAI_ERROR';
  }
}

/**
 * Error response formatter
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId?: string;
  };
}

export function formatErrorResponse(
  error: AppError | Error,
  requestId?: string,
  includeStack: boolean = false
): ErrorResponse {
  const isAppError = error instanceof AppError;

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: isAppError ? error.errorCode : 'INTERNAL_ERROR',
      message: error.message,
      timestamp: new Date().toISOString(),
      ...(requestId && { requestId }),
    },
  };

  // Include stack trace in development
  if (includeStack && error.stack) {
    errorResponse.error.details = { stack: error.stack };
  }

  return errorResponse;
}

/**
 * Async error handler wrapper
 */
export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R | void> {
  return async (...args: T): Promise<R | void> => {
    try {
      return await fn(...args);
    } catch (error) {
      // Let the global error handler deal with it
      throw error;
    }
  };
}

/**
 * Error logging utility
 */
export interface ErrorLogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  path?: string;
  method?: string;
  body?: any;
  query?: any;
  headers?: Record<string, string>;
}

export class ErrorLogger {
  static logError(error: Error, context?: ErrorLogContext) {
    const logData = {
      message: error.message,
      stack: error.stack,
      ...(error instanceof AppError && {
        statusCode: error.statusCode,
        errorCode: error.errorCode,
        isOperational: error.isOperational,
      }),
      context: {
        timestamp: new Date().toISOString(),
        ...context,
      },
    };

    // Use existing logger
    const { logger } = require('./logger');

    if (error instanceof AppError && error.isOperational) {
      logger.warn('Operational error occurred', logData);
    } else {
      logger.error('Unexpected error occurred', logData);
    }
  }
}

/**
 * Common error scenarios
 */
export const Errors = {
  // Authentication
  INVALID_TOKEN: () => new AuthenticationError('Invalid or expired token'),
  TOKEN_REQUIRED: () => new AuthenticationError('Authorization token required'),
  INVALID_CREDENTIALS: () => new AuthenticationError('Invalid email or password'),

  // Authorization
  INSUFFICIENT_PERMISSIONS: () => new AuthorizationError(),
  ADMIN_REQUIRED: () => new AuthorizationError('Admin privileges required'),

  // Validation
  REQUIRED_FIELD: (field: string) => new ValidationError(`${field} is required`, field),
  INVALID_FORMAT: (field: string) => new ValidationError(`Invalid ${field} format`, field),
  INVALID_EMAIL: () => new ValidationError('Invalid email format', 'email'),
  WEAK_PASSWORD: () => new ValidationError('Password too weak', 'password'),

  // Resources
  USER_NOT_FOUND: () => new NotFoundError('User'),
  MESSAGE_NOT_FOUND: () => new NotFoundError('Message'),

  // Conflicts
  USER_EXISTS: () => new ConflictError('User with this email already exists'),
  DUPLICATE_ENTRY: (field: string) => new ConflictError(`${field} already exists`),

  // External APIs
  WHATSAPP_RATE_LIMIT: () => new WhatsAppAPIError('Rate limit exceeded'),
  WHATSAPP_INVALID_PHONE: () => new WhatsAppAPIError('Invalid phone number'),
  OPENAI_QUOTA_EXCEEDED: () => new OpenAIError('API quota exceeded'),
  OPENAI_INVALID_REQUEST: () => new OpenAIError('Invalid request format'),

  // System
  DATABASE_CONNECTION: () => new DatabaseError('connection'),
  REDIS_CONNECTION: () => new AppError('Redis connection failed', 500, 'REDIS_ERROR'),
  FILE_UPLOAD_FAILED: () => new AppError('File upload failed', 400, 'FILE_UPLOAD_ERROR'),
};