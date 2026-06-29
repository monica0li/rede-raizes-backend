import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { authMiddleware } from '../middlewares/auth';
import { auditLog } from '../middlewares/audit';

const router = Router();
const paymentController = new PaymentController();

router.post('/process', authMiddleware, auditLog('PROCESS_PAYMENT', 'Payment'), paymentController.processPayment.bind(paymentController));
router.get('/status/:orderId', authMiddleware, paymentController.getPaymentStatus.bind(paymentController));

export default router;