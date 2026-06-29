import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { authMiddleware } from '../middlewares/auth';
import { auditLog } from '../middlewares/audit';

const router = Router();
const paymentController = new PaymentController();

/**
 * @swagger
 * /payments/process:
 *   post:
 *     summary: Processar pagamento (mock)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: integer
 *               forceStatus:
 *                 type: string
 *                 enum: [APROVADO, RECUSADO]
 *     responses:
 *       200:
 *         description: Pagamento processado
 *       404:
 *         description: Pedido não encontrado
 *       409:
 *         description: Pedido já pago
 */
router.post('/process', authMiddleware, auditLog('PROCESS_PAYMENT', 'Payment'), paymentController.processPayment.bind(paymentController));

/**
 * @swagger
 * /payments/status/{orderId}:
 *   get:
 *     summary: Consultar status do pagamento
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Status do pagamento
 *       404:
 *         description: Pedido não encontrado
 */
router.get('/status/:orderId', authMiddleware, paymentController.getPaymentStatus.bind(paymentController));

export default router;