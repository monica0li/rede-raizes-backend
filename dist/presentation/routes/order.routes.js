"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const OrderController_1 = require("../controllers/OrderController");
const auth_1 = require("../middlewares/auth");
const audit_1 = require("../middlewares/audit");
const router = (0, express_1.Router)();
const orderController = new OrderController_1.OrderController();
// Rotas protegidas com auditoria
router.post('/', auth_1.authMiddleware, (0, audit_1.auditLog)('CREATE_ORDER', 'Order'), orderController.create.bind(orderController));
router.get('/', auth_1.authMiddleware, orderController.findAll.bind(orderController));
router.get('/:id', auth_1.authMiddleware, orderController.findById.bind(orderController));
router.patch('/:id/status', auth_1.authMiddleware, (0, audit_1.auditLog)('UPDATE_STATUS', 'Order'), orderController.updateStatus.bind(orderController));
router.patch('/:id/cancel', auth_1.authMiddleware, (0, audit_1.auditLog)('CANCEL_ORDER', 'Order'), orderController.cancel.bind(orderController));
exports.default = router;
