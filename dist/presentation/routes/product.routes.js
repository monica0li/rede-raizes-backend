"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProductController_1 = require("../controllers/ProductController");
const auth_1 = require("../middlewares/auth");
const audit_1 = require("../middlewares/audit");
const router = (0, express_1.Router)();
const productController = new ProductController_1.ProductController();
/**
 * @swagger
 * /products:
 *   get:
 *     summary: Listar produtos
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: unitId
 *         schema:
 *           type: integer
 *         description: Filtrar por unidade
 *     responses:
 *       200:
 *         description: Lista de produtos
 */
router.get('/', productController.findAll.bind(productController));
/**
 * @swagger
 * /products:
 *   post:
 *     summary: Criar produto (ADMIN)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               unitId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post('/', auth_1.authMiddleware, auth_1.adminMiddleware, (0, audit_1.auditLog)('CREATE_PRODUCT', 'Product'), productController.create.bind(productController));
router.get('/:id', productController.findById.bind(productController));
router.delete('/:id', auth_1.authMiddleware, auth_1.adminMiddleware, (0, audit_1.auditLog)('DELETE_PRODUCT', 'Product'), productController.delete.bind(productController));
exports.default = router;
