"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PromotionController_1 = require("../controllers/PromotionController");
const auth_1 = require("../middlewares/auth");
const audit_1 = require("../middlewares/audit");
const router = (0, express_1.Router)();
const promotionController = new PromotionController_1.PromotionController();
// Rotas públicas
router.get('/active', promotionController.getActive.bind(promotionController));
// Rotas ADMIN com auditoria
router.get('/', auth_1.authMiddleware, auth_1.adminMiddleware, promotionController.findAll.bind(promotionController));
router.get('/:id', auth_1.authMiddleware, auth_1.adminMiddleware, promotionController.findById.bind(promotionController));
router.post('/', auth_1.authMiddleware, auth_1.adminMiddleware, (0, audit_1.auditLog)('CREATE_PROMOTION', 'Promotion'), promotionController.create.bind(promotionController));
router.put('/:id', auth_1.authMiddleware, auth_1.adminMiddleware, (0, audit_1.auditLog)('UPDATE_PROMOTION', 'Promotion'), promotionController.update.bind(promotionController));
router.delete('/:id', auth_1.authMiddleware, auth_1.adminMiddleware, (0, audit_1.auditLog)('DELETE_PROMOTION', 'Promotion'), promotionController.delete.bind(promotionController));
router.patch('/:id/reactivate', auth_1.authMiddleware, auth_1.adminMiddleware, (0, audit_1.auditLog)('REACTIVATE_PROMOTION', 'Promotion'), promotionController.reactivate.bind(promotionController));
exports.default = router;
