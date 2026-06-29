"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UnitController_1 = require("../controllers/UnitController");
const auth_1 = require("../middlewares/auth");
const audit_1 = require("../middlewares/audit");
const router = (0, express_1.Router)();
const unitController = new UnitController_1.UnitController();
// Rotas públicas
router.get('/', unitController.findAll.bind(unitController));
router.get('/:id', unitController.findById.bind(unitController));
// Rotas ADMIN com auditoria
router.get('/all', auth_1.authMiddleware, auth_1.adminMiddleware, unitController.findAllIncludingInactive.bind(unitController));
router.post('/', auth_1.authMiddleware, auth_1.adminMiddleware, (0, audit_1.auditLog)('CREATE_UNIT', 'Unit'), unitController.create.bind(unitController));
router.put('/:id', auth_1.authMiddleware, auth_1.adminMiddleware, (0, audit_1.auditLog)('UPDATE_UNIT', 'Unit'), unitController.update.bind(unitController));
router.delete('/:id', auth_1.authMiddleware, auth_1.adminMiddleware, (0, audit_1.auditLog)('DELETE_UNIT', 'Unit'), unitController.delete.bind(unitController));
router.patch('/:id/reactivate', auth_1.authMiddleware, auth_1.adminMiddleware, (0, audit_1.auditLog)('REACTIVATE_UNIT', 'Unit'), unitController.reactivate.bind(unitController));
exports.default = router;
