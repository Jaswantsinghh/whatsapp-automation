import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, users, userSessions } from '../db';
import { eq, and } from 'drizzle-orm';
import { logger } from '../utils/logger';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'manager' | 'agent';
}

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn = '7d';
  private readonly refreshTokenExpiresIn = '30d';

  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    this.jwtSecret = secret;
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterData) {
    try {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);

      if (existingUser.length > 0) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const saltRounds = 12; // High security for production
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          email: userData.email,
          name: userData.name,
          passwordHash,
          role: userData.role || 'agent',
          isActive: true,
        })
        .returning({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          createdAt: users.createdAt,
        });

      logger.info('User registered successfully', {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      });

      return {
        user: newUser,
        message: 'User registered successfully',
      };

    } catch (error) {
      logger.error('User registration failed:', error);
      throw error;
    }
  }

  /**
   * Login user and generate tokens
   */
  async login(credentials: LoginCredentials) {
    try {
      // Find user by email
      const [user] = await db
        .select()
        .from(users)
        .where(and(
          eq(users.email, credentials.email),
          eq(users.isActive, true)
        ))
        .limit(1);

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = this.generateAccessToken(tokenPayload);
      const refreshToken = this.generateRefreshToken(tokenPayload);

      // Save session
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

      await db.insert(userSessions).values({
        userId: user.id,
        token: accessToken,
        refreshToken,
        expiresAt,
      });

      // Update last active
      await db
        .update(users)
        .set({ lastActiveAt: new Date() })
        .where(eq(users.id, user.id));

      logger.info('User login successful', {
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: this.jwtExpiresIn,
        },
      };

    } catch (error) {
      logger.error('User login failed:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.jwtSecret) as TokenPayload;

      // Check if session exists and is valid
      const [session] = await db
        .select()
        .from(userSessions)
        .where(and(
          eq(userSessions.refreshToken, refreshToken),
          eq(userSessions.isRevoked, false)
        ))
        .limit(1);

      if (!session || session.expiresAt < new Date()) {
        throw new Error('Invalid or expired refresh token');
      }

      // Get user data
      const [user] = await db
        .select()
        .from(users)
        .where(and(
          eq(users.id, decoded.userId),
          eq(users.isActive, true)
        ))
        .limit(1);

      if (!user) {
        throw new Error('User not found or inactive');
      }

      // Generate new access token
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const newAccessToken = this.generateAccessToken(tokenPayload);

      // Update session with new token
      await db
        .update(userSessions)
        .set({ token: newAccessToken })
        .where(eq(userSessions.id, session.id));

      return {
        accessToken: newAccessToken,
        expiresIn: this.jwtExpiresIn,
      };

    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Logout user and revoke session
   */
  async logout(token: string) {
    try {
      // Find and revoke session
      await db
        .update(userSessions)
        .set({ isRevoked: true })
        .where(eq(userSessions.token, token));

      logger.info('User logout successful');

      return { message: 'Logged out successfully' };

    } catch (error) {
      logger.error('User logout failed:', error);
      throw error;
    }
  }

  /**
   * Verify access token
   */
  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;

      // Check if session is still valid
      const [session] = await db
        .select()
        .from(userSessions)
        .where(and(
          eq(userSessions.token, token),
          eq(userSessions.isRevoked, false)
        ))
        .limit(1);

      if (!session || session.expiresAt < new Date()) {
        throw new Error('Session expired or revoked');
      }

      // Get fresh user data
      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          isActive: users.isActive,
        })
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1);

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      return user;

    } catch (error) {
      logger.error('Token verification failed:', error);
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    try {
      // Get current user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await db
        .update(users)
        .set({ passwordHash: newPasswordHash })
        .where(eq(users.id, userId));

      // Revoke all existing sessions for security
      await db
        .update(userSessions)
        .set({ isRevoked: true })
        .where(eq(userSessions.userId, userId));

      logger.info('Password changed successfully', { userId });

      return { message: 'Password changed successfully' };

    } catch (error) {
      logger.error('Password change failed:', error);
      throw error;
    }
  }

  /**
   * Generate access token
   */
  private generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
      issuer: 'whatsapp-webhook',
      audience: 'dashboard',
    });
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.refreshTokenExpiresIn,
      issuer: 'whatsapp-webhook',
      audience: 'dashboard',
    });
  }
}

// Export singleton instance
export const authService = new AuthService();