"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PaymentController_1 = require("../controllers/PaymentController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const paymentController = new PaymentController_1.PaymentController();
// POST /payments/process - Processar pagamento (mock)
router.post('/process', auth_1.authMiddleware, paymentController.processPayment.bind(paymentController));
// GET /payments/status/:orderId - Consultar status do pagamento
router.get('/status/:orderId', auth_1.authMiddleware, paymentController.getPaymentStatus.bind(paymentController));
exports.default = router;
