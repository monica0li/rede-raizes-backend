import { Router } from 'express';
import { LoyaltyController } from '../controllers/LoyaltyController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const loyaltyController = new LoyaltyController();

/**
 * @swagger
 * /loyalty/balance:
 *   get:
 *     summary: Consultar saldo de pontos
 *     tags: [Loyalty]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Saldo de pontos do usuário
 */
router.get('/balance', authMiddleware, loyaltyController.getBalance.bind(loyaltyController));

/**
 * @swagger
 * /loyalty/history:
 *   get:
 *     summary: Consultar histórico de transações
 *     tags: [Loyalty]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Histórico de pontos
 */
router.get('/history', authMiddleware, loyaltyController.getHistory.bind(loyaltyController));

export default router;