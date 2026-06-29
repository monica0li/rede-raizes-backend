"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProductController_1 = require("../controllers/ProductController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const productController = new ProductController_1.ProductController();
// Rotas públicas (listar)
router.get('/', productController.findAll.bind(productController));
router.get('/:id', productController.findById.bind(productController));
// Rotas protegidas (ADMIN)
router.post('/', auth_1.authMiddleware, auth_1.adminMiddleware, productController.create.bind(productController));
router.put('/:id', auth_1.authMiddleware, auth_1.adminMiddleware, productController.update.bind(productController));
router.delete('/:id', auth_1.authMiddleware, auth_1.adminMiddleware, productController.delete.bind(productController));
router.patch('/:id/reactivate', auth_1.authMiddleware, auth_1.adminMiddleware, productController.reactivate.bind(productController));
exports.default = router;
