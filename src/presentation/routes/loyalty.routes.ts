import { Router } from 'express';
import { LoyaltyController } from '../controllers/LoyaltyController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const loyaltyController = new LoyaltyController();

router.get('/balance', authMiddleware, loyaltyController.getBalance.bind(loyaltyController));
router.get('/history', authMiddleware, loyaltyController.getHistory.bind(loyaltyController));

export default router;