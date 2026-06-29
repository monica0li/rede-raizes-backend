import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const paymentController = new PaymentController();

// POST /payments/process - Processar pagamento (mock)
router.post('/process', authMiddleware, paymentController.processPayment.bind(paymentController));

// GET /payments/status/:orderId - Consultar status do pagamento
router.get('/status/:orderId', authMiddleware, paymentController.getPaymentStatus.bind(paymentController));

export default router;