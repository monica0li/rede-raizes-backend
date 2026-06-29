"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const OrderController_1 = require("../controllers/OrderController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const orderController = new OrderController_1.OrderController();
// Rotas protegidas
router.post('/', auth_1.authMiddleware, orderController.create.bind(orderController));
router.get('/', auth_1.authMiddleware, orderController.findAll.bind(orderController));
router.get('/:id', auth_1.authMiddleware, orderController.findById.bind(orderController));
router.patch('/:id/status', auth_1.authMiddleware, orderController.updateStatus.bind(orderController));
router.patch('/:id/cancel', auth_1.authMiddleware, orderController.cancel.bind(orderController));
exports.default = router;
