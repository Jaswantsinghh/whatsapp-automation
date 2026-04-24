import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { logger } from '../utils/logger';
import { z } from 'zod';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['admin', 'manager', 'agent']).optional(),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
});

class AuthController {
  /**
   * Login user
   */
  async login(req: Request, res: Response) {
    try {
      const validatedBody = loginSchema.parse(req.body);

      const result = await authService.login(validatedBody);

      // Set HTTP-only cookie for refresh token (more secure)
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          expiresIn: result.tokens.expiresIn,
        },
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: error.errors,
        });
      }

      logger.error('Login error:', error);

      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      });
    }
  }

  /**
   * Register new user
   */
  async register(req: Request, res: Response) {
    try {
      const validatedBody = registerSchema.parse(req.body);

      // In production, you might want to restrict registration to admins only
      // or require email verification
      const result = await authService.register(validatedBody);

      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          user: result.user,
        },
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: error.errors,
        });
      }

      logger.error('Registration error:', error);

      // Don't expose detailed errors for security
      const message = error instanceof Error && error.message.includes('already exists')
        ? 'User with this email already exists'
        : 'Registration failed';

      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response) {
    try {
      let refreshToken: string;

      // Try to get refresh token from cookie first, then body
      if (req.cookies?.refreshToken) {
        refreshToken = req.cookies.refreshToken;
      } else {
        const validatedBody = refreshTokenSchema.parse(req.body);
        refreshToken = validatedBody.refreshToken;
      }

      const result = await authService.refreshToken(refreshToken);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
        },
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: error.errors,
        });
      }

      logger.error('Token refresh error:', error);

      // Clear invalid refresh token cookie
      res.clearCookie('refreshToken');

      res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token',
      });
    }
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];

      if (token) {
        await authService.logout(token);
      }

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Logged out successfully',
      });

    } catch (error) {
      logger.error('Logout error:', error);

      res.status(500).json({
        success: false,
        error: 'Logout failed',
      });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      res.json({
        success: true,
        data: {
          user: req.user,
        },
      });

    } catch (error) {
      logger.error('Get profile error:', error);

      res.status(500).json({
        success: false,
        error: 'Failed to get profile',
      });
    }
  }

  /**
   * Change user password
   */
  async changePassword(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const validatedBody = changePasswordSchema.parse(req.body);

      await authService.changePassword(
        req.user.id,
        validatedBody.currentPassword,
        validatedBody.newPassword
      );

      res.json({
        success: true,
        message: 'Password changed successfully',
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: error.errors,
        });
      }

      logger.error('Change password error:', error);

      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to change password',
      });
    }
  }

  /**
   * Verify token (for frontend to check if user is still authenticated)
   */
  async verifyToken(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'No token provided',
        });
      }

      const user = await authService.verifyToken(token);

      res.json({
        success: true,
        data: {
          user,
          valid: true,
        },
      });

    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        valid: false,
      });
    }
  }
}

export const authController = new AuthController();