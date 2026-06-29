import { Router } from 'express';
import { LoyaltyController } from '../controllers/LoyaltyController';
import { authMiddleware } from '../middlewares/auth';
import { auditLog } from '../middlewares/audit';

const router = Router();
const loyaltyController = new LoyaltyController();

// Rotas protegidas com auditoria
router.get('/balance', authMiddleware, loyaltyController.getBalance.bind(loyaltyController));
router.get('/history', authMiddleware, loyaltyController.getHistory.bind(loyaltyController));
router.post('/redeem', authMiddleware, auditLog('REDEEM_POINTS', 'Loyalty'), loyaltyController.redeemPoints.bind(loyaltyController));

export default router;