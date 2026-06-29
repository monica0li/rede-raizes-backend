"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UnitController_1 = require("../controllers/UnitController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const unitController = new UnitController_1.UnitController();
// Rotas públicas (apenas listar ativas)
router.get('/', unitController.findAll.bind(unitController));
router.get('/:id', unitController.findById.bind(unitController));
// Rota ADMIN para ver TODAS (incluindo inativas)
router.get('/all', auth_1.authMiddleware, auth_1.adminMiddleware, unitController.findAllIncludingInactive.bind(unitController));
// Rotas protegidas (ADMIN)
router.post('/', auth_1.authMiddleware, auth_1.adminMiddleware, unitController.create.bind(unitController));
router.put('/:id', auth_1.authMiddleware, auth_1.adminMiddleware, unitController.update.bind(unitController));
router.delete('/:id', auth_1.authMiddleware, auth_1.adminMiddleware, unitController.delete.bind(unitController));
router.patch('/:id/reactivate', auth_1.authMiddleware, auth_1.adminMiddleware, unitController.reactivate.bind(unitController));
exports.default = router;
