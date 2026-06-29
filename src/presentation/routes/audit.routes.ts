import { Router } from 'express';
import { AuditController } from '../controllers/AuditController';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';

const router = Router();
const auditController = new AuditController();

/**
 * @swagger
 * /audit-logs:
 *   get:
 *     summary: Listar logs de auditoria (ADMIN)
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de logs
 *       403:
 *         description: Sem permissão
 */
router.get('/', authMiddleware, adminMiddleware, auditController.getLogs.bind(auditController));

router.get('/order/:orderId', authMiddleware, adminMiddleware, auditController.getLogsByOrder.bind(auditController));
router.get('/user/:userId', authMiddleware, adminMiddleware, auditController.getLogsByUser.bind(auditController));

export default router;