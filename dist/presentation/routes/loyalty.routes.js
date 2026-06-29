"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const LoyaltyController_1 = require("../controllers/LoyaltyController");
const auth_1 = require("../middlewares/auth");
const audit_1 = require("../middlewares/audit");
const router = (0, express_1.Router)();
const loyaltyController = new LoyaltyController_1.LoyaltyController();
// Rotas protegidas com auditoria
router.get('/balance', auth_1.authMiddleware, loyaltyController.getBalance.bind(loyaltyController));
router.get('/history', auth_1.authMiddleware, loyaltyController.getHistory.bind(loyaltyController));
router.post('/redeem', auth_1.authMiddleware, (0, audit_1.auditLog)('REDEEM_POINTS', 'Loyalty'), loyaltyController.redeemPoints.bind(loyaltyController));
exports.default = router;
