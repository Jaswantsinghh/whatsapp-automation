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
router.get('/users', authenticateToken, requireAdmin, authController.getAllUsers);
router.put('/users/:id', authenticateToken, requireAdmin, auditLog('update_user'), authController.updateUser);
router.delete('/users/:id', authenticateToken, requireAdmin, auditLog('delete_user'), authController.deleteUser);
router.put('/users/:id/permissions', authenticateToken, requireAdmin, auditLog('update_permissions'), authController.updateUserPermissions);

export { router as authRoutes };