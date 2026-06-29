import { Router } from 'express';
import { StockController } from '../controllers/StockController';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';
import { auditLog } from '../middlewares/audit';

const router = Router();
const stockController = new StockController();

/**
 * @swagger
 * /stock/add:
 *   post:
 *     summary: Adicionar estoque (ADMIN)
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *               unitId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Estoque atualizado
 *       404:
 *         description: Produto não encontrado
 */
router.post('/add', authMiddleware, adminMiddleware, auditLog('ADD_STOCK', 'Stock'), stockController.addStock.bind(stockController));

/**
 * @swagger
 * /stock/{productId}:
 *   get:
 *     summary: Consultar estoque de um produto
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados do estoque
 *       404:
 *         description: Estoque não encontrado
 */
router.get('/:productId', authMiddleware, stockController.getStock.bind(stockController));

export default router;