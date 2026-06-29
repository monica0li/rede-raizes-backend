"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PaymentController_1 = require("../controllers/PaymentController");
const auth_1 = require("../middlewares/auth");
const audit_1 = require("../middlewares/audit");
const router = (0, express_1.Router)();
const paymentController = new PaymentController_1.PaymentController();
/**
 * @swagger
 * /payments/process:
 *   post:
 *     summary: Processar pagamento (mock)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: integer
 *               forceStatus:
 *                 type: string
 *                 enum: [APROVADO, RECUSADO]
 *     responses:
 *       200:
 *         description: Pagamento processado
 *       404:
 *         description: Pedido não encontrado
 *       409:
 *         description: Pedido já pago
 */
router.post('/process', auth_1.authMiddleware, (0, audit_1.auditLog)('PROCESS_PAYMENT', 'Payment'), paymentController.processPayment.bind(paymentController));
/**
 * @swagger
 * /payments/status/{orderId}:
 *   get:
 *     summary: Consultar status do pagamento
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Status do pagamento
 *       404:
 *         description: Pedido não encontrado
 */
router.get('/status/:orderId', auth_1.authMiddleware, paymentController.getPaymentStatus.bind(paymentController));
exports.default = router;
