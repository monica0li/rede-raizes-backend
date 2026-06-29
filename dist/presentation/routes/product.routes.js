"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProductController_1 = require("../controllers/ProductController");
const auth_1 = require("../middlewares/auth");
const audit_1 = require("../middlewares/audit");
const router = (0, express_1.Router)();
const productController = new ProductController_1.ProductController();
// Rotas públicas
router.get('/', productController.findAll.bind(productController));
router.get('/:id', productController.findById.bind(productController));
// Rotas ADMIN com auditoria
router.post('/', auth_1.authMiddleware, auth_1.adminMiddleware, (0, audit_1.auditLog)('CREATE_PRODUCT', 'Product'), productController.create.bind(productController));
router.put('/:id', auth_1.authMiddleware, auth_1.adminMiddleware, (0, audit_1.auditLog)('UPDATE_PRODUCT', 'Product'), productController.update.bind(productController));
router.delete('/:id', auth_1.authMiddleware, auth_1.adminMiddleware, (0, audit_1.auditLog)('DELETE_PRODUCT', 'Product'), productController.delete.bind(productController));
router.patch('/:id/reactivate', auth_1.authMiddleware, auth_1.adminMiddleware, (0, audit_1.auditLog)('REACTIVATE_PRODUCT', 'Product'), productController.reactivate.bind(productController));
exports.default = router;
