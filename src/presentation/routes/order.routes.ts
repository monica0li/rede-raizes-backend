import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';

const router = Router();
const orderController = new OrderController();

//rotas protegidas
router.post('/', authMiddleware, orderController.create.bind(orderController));
router.get('/', authMiddleware, orderController.findAll.bind(orderController));
router.get('/:id', authMiddleware, orderController.findById.bind(orderController));
router.patch('/:id/status', authMiddleware, orderController.updateStatus.bind(orderController));
router.patch('/:id/cancel', authMiddleware, orderController.cancel.bind(orderController));

export default router;