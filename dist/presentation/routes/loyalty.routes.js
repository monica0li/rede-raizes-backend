"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const LoyaltyController_1 = require("../controllers/LoyaltyController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const loyaltyController = new LoyaltyController_1.LoyaltyController();
/**
 * @swagger
 * /loyalty/balance:
 *   get:
 *     summary: Consultar saldo de pontos
 *     tags: [Loyalty]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Saldo de pontos do usuário
 */
router.get('/balance', auth_1.authMiddleware, loyaltyController.getBalance.bind(loyaltyController));
/**
 * @swagger
 * /loyalty/history:
 *   get:
 *     summary: Consultar histórico de transações
 *     tags: [Loyalty]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Histórico de pontos
 */
router.get('/history', auth_1.authMiddleware, loyaltyController.getHistory.bind(loyaltyController));
exports.default = router;
