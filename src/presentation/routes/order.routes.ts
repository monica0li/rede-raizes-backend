import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { authMiddleware } from '../middlewares/auth';
import { auditLog } from '../middlewares/audit';

const router = Router();
const orderController = new OrderController();

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Criar um pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               unitId:
 *                 type: integer
 *               channel:
 *                 type: string
 *                 enum: [APP, TOTEM, BALCAO, PICKUP, WEB]
 *               usePoints:
 *                 type: integer
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *       409:
 *         description: Estoque insuficiente
 *       422:
 *         description: Canal inválido
 */
router.post('/', authMiddleware, auditLog('CREATE_ORDER', 'Order'), orderController.create.bind(orderController));

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Listar pedidos
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: channel
 *         schema:
 *           type: string
 *         description: Filtrar por canal
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrar por status
 *     responses:
 *       200:
 *         description: Lista de pedidos
 */
router.get('/', authMiddleware, orderController.findAll.bind(orderController));

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Atualizar status do pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [AGUARDANDO_PAGAMENTO, PAGO, PREPARANDO, PRONTO, ENTREGUE, CANCELADO]
 *     responses:
 *       200:
 *         description: Status atualizado
 *       404:
 *         description: Pedido não encontrado
 */
router.patch('/:id/status', authMiddleware, auditLog('UPDATE_STATUS', 'Order'), orderController.updateStatus.bind(orderController));

/**
 * @swagger
 * /orders/{id}/cancel:
 *   patch:
 *     summary: Cancelar pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pedido cancelado
 *       404:
 *         description: Pedido não encontrado
 */
router.patch('/:id/cancel', authMiddleware, auditLog('CANCEL_ORDER', 'Order'), orderController.cancel.bind(orderController));

router.get('/:id', authMiddleware, orderController.findById.bind(orderController));

export default router;