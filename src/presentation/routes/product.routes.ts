import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';
import { auditLog } from '../middlewares/audit';

const router = Router();
const productController = new ProductController();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Listar produtos
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: unitId
 *         schema:
 *           type: integer
 *         description: Filtrar por unidade
 *     responses:
 *       200:
 *         description: Lista de produtos
 */
router.get('/', productController.findAll.bind(productController));

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Criar produto (ADMIN)
 *     tags: [Products]
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
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               unitId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post('/', authMiddleware, adminMiddleware, auditLog('CREATE_PRODUCT', 'Product'), productController.create.bind(productController));

router.get('/:id', productController.findById.bind(productController));
router.delete('/:id', authMiddleware, adminMiddleware, auditLog('DELETE_PRODUCT', 'Product'), productController.delete.bind(productController));

export default router;