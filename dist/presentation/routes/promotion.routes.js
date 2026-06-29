"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PromotionController_1 = require("../controllers/PromotionController");
const auth_1 = require("../middlewares/auth");
const audit_1 = require("../middlewares/audit");
const router = (0, express_1.Router)();
const promotionController = new PromotionController_1.PromotionController();
/**
 * @swagger
 * /promotions/active:
 *   get:
 *     summary: Listar promoções ativas
 *     tags: [Promotions]
 *     responses:
 *       200:
 *         description: Lista de promoções ativas
 */
router.get('/active', promotionController.getActive.bind(promotionController));
/**
 * @swagger
 * /promotions:
 *   post:
 *     summary: Criar promoção (ADMIN)
 *     tags: [Promotions]
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
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [PERCENTUAL, FIXO]
 *               value:
 *                 type: number
 *               minOrderValue:
 *                 type: number
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *     responses:
 *       201:
 *         description: Promoção criada
 */
router.post('/', auth_1.authMiddleware, auth_1.adminMiddleware, (0, audit_1.auditLog)('CREATE_PROMOTION', 'Promotion'), promotionController.create.bind(promotionController));
router.get('/', auth_1.authMiddleware, auth_1.adminMiddleware, promotionController.findAll.bind(promotionController));
exports.default = router;
