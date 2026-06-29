import { Router } from 'express';
import { AuditController } from '../controllers/AuditController';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';

const router = Router();
const auditController = new AuditController();

// Rotas protegidas (ADMIN)
router.get('/', authMiddleware, adminMiddleware, auditController.getLogs.bind(auditController));
router.get('/order/:orderId', authMiddleware, adminMiddleware, auditController.getLogsByOrder.bind(auditController));
router.get('/user/:userId', authMiddleware, adminMiddleware, auditController.getLogsByUser.bind(auditController));

export default router;