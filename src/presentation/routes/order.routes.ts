import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { authMiddleware } from '../middlewares/auth';
import { auditLog } from '../middlewares/audit';

const router = Router();
const orderController = new OrderController();

// Rotas protegidas com auditoria
router.post('/', authMiddleware, auditLog('CREATE_ORDER', 'Order'), orderController.create.bind(orderController));
router.get('/', authMiddleware, orderController.findAll.bind(orderController));
router.get('/:id', authMiddleware, orderController.findById.bind(orderController));
router.patch('/:id/status', authMiddleware, auditLog('UPDATE_STATUS', 'Order'), orderController.updateStatus.bind(orderController));
router.patch('/:id/cancel', authMiddleware, auditLog('CANCEL_ORDER', 'Order'), orderController.cancel.bind(orderController));

export default router;