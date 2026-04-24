import express from 'express';
import { authController } from '../controllers/authController';
import { authenticateToken, requireAdmin, auditLog } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/login', auditLog('login'), authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/verify', authController.verifyToken);

// Protected routes
router.post('/logout', authenticateToken, auditLog('logout'), authController.logout);
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/change-password', authenticateToken, auditLog('change_password'), authController.changePassword);

// Admin only routes
router.post('/register', authenticateToken, requireAdmin, auditLog('register_user'), authController.register);

export { router as authRoutes };