"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UnitController_1 = require("../controllers/UnitController");
const auth_1 = require("../middlewares/auth");
const audit_1 = require("../middlewares/audit");
const router = (0, express_1.Router)();
const unitController = new UnitController_1.UnitController();
/**
 * @swagger
 * /units:
 *   get:
 *     summary: Listar todas as unidades ativas
 *     tags: [Units]
 *     responses:
 *       200:
 *         description: Lista de unidades
 */
router.get('/', unitController.findAll.bind(unitController));
/**
 * @swagger
 * /units:
 *   post:
 *     summary: Criar uma nova unidade (ADMIN)
 *     tags: [Units]
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
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Unidade criada com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post('/', auth_1.authMiddleware, auth_1.adminMiddleware, (0, audit_1.auditLog)('CREATE_UNIT', 'Unit'), unitController.create.bind(unitController));
/**
 * @swagger
 * /units/{id}:
 *   delete:
 *     summary: Inativar unidade (ADMIN)
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Unidade inativada com sucesso
 *       404:
 *         description: Unidade não encontrada
 */
router.delete('/:id', auth_1.authMiddleware, auth_1.adminMiddleware, (0, audit_1.auditLog)('DELETE_UNIT', 'Unit'), unitController.delete.bind(unitController));
/**
 * @swagger
 * /units/{id}/reactivate:
 *   patch:
 *     summary: Reativar unidade (ADMIN)
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Unidade reativada com sucesso
 *       404:
 *         description: Unidade não encontrada
 */
router.patch('/:id/reactivate', auth_1.authMiddleware, auth_1.adminMiddleware, (0, audit_1.auditLog)('REACTIVATE_UNIT', 'Unit'), unitController.reactivate.bind(unitController));
router.get('/:id', unitController.findById.bind(unitController));
router.put('/:id', auth_1.authMiddleware, auth_1.adminMiddleware, (0, audit_1.auditLog)('UPDATE_UNIT', 'Unit'), unitController.update.bind(unitController));
exports.default = router;
