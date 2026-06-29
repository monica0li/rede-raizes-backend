"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const StockController_1 = require("../controllers/StockController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const stockController = new StockController_1.StockController();
// Apenas ADMIN pode gerenciar estoque
router.post('/add', auth_1.authMiddleware, auth_1.adminMiddleware, stockController.addStock.bind(stockController));
router.put('/:productId', auth_1.authMiddleware, auth_1.adminMiddleware, stockController.updateStock.bind(stockController));
router.get('/:productId', auth_1.authMiddleware, stockController.getStock.bind(stockController));
exports.default = router;
