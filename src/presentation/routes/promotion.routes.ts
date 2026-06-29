import { Router } from 'express';
import { PromotionController } from '../controllers/PromotionController';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';
import { auditLog } from '../middlewares/audit';

const router = Router();
const promotionController = new PromotionController();

/**
 * @swagger
 * /promotions/active:
 *   get:
 *     summary: Listar promoções ativas
 *     tags: [Promotions]
 *     responses:
 *       200:
 *         description: Lista de promoções ativas
 */
router.get('/active', promotionController.getActive.bind(promotionController));

/**
 * @swagger
 * /promotions:
 *   post:
 *     summary: Criar promoção (ADMIN)
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [PERCENTUAL, FIXO]
 *               value:
 *                 type: number
 *               minOrderValue:
 *                 type: number
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *     responses:
 *       201:
 *         description: Promoção criada
 */
router.post('/', authMiddleware, adminMiddleware, auditLog('CREATE_PROMOTION', 'Promotion'), promotionController.create.bind(promotionController));

router.get('/', authMiddleware, adminMiddleware, promotionController.findAll.bind(promotionController));

export default router;