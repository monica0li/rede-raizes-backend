"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const StockController_1 = require("../controllers/StockController");
const auth_1 = require("../middlewares/auth");
const audit_1 = require("../middlewares/audit");
const router = (0, express_1.Router)();
const stockController = new StockController_1.StockController();
// Apenas ADMIN com auditoria
router.post('/add', auth_1.authMiddleware, auth_1.adminMiddleware, (0, audit_1.auditLog)('ADD_STOCK', 'Stock'), stockController.addStock.bind(stockController));
router.put('/:productId', auth_1.authMiddleware, auth_1.adminMiddleware, (0, audit_1.auditLog)('UPDATE_STOCK', 'Stock'), stockController.updateStock.bind(stockController));
router.get('/:productId', auth_1.authMiddleware, stockController.getStock.bind(stockController));
exports.default = router;
