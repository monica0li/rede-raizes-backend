"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const StockController_1 = require("../controllers/StockController");
const auth_1 = require("../middlewares/auth");
const audit_1 = require("../middlewares/audit");
const router = (0, express_1.Router)();
const stockController = new StockController_1.StockController();
/**
 * @swagger
 * /stock/add:
 *   post:
 *     summary: Adicionar estoque (ADMIN)
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *               unitId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Estoque atualizado
 *       404:
 *         description: Produto não encontrado
 */
router.post('/add', auth_1.authMiddleware, auth_1.adminMiddleware, (0, audit_1.auditLog)('ADD_STOCK', 'Stock'), stockController.addStock.bind(stockController));
/**
 * @swagger
 * /stock/{productId}:
 *   get:
 *     summary: Consultar estoque de um produto
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados do estoque
 *       404:
 *         description: Estoque não encontrado
 */
router.get('/:productId', auth_1.authMiddleware, stockController.getStock.bind(stockController));
exports.default = router;
