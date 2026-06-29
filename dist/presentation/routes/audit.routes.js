"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuditController_1 = require("../controllers/AuditController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const auditController = new AuditController_1.AuditController();
// Rotas protegidas (ADMIN)
router.get('/', auth_1.authMiddleware, auth_1.adminMiddleware, auditController.getLogs.bind(auditController));
router.get('/order/:orderId', auth_1.authMiddleware, auth_1.adminMiddleware, auditController.getLogsByOrder.bind(auditController));
router.get('/user/:userId', auth_1.authMiddleware, auth_1.adminMiddleware, auditController.getLogsByUser.bind(auditController));
exports.default = router;
