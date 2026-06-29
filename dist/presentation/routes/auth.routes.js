"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const audit_1 = require("../middlewares/audit");
const router = (0, express_1.Router)();
const authController = new AuthController_1.AuthController();
console.log('Rotas de autenticacao carregadas!');
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Cadastrar um novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, CLIENTE, ATENDENTE, COZINHA]
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       422:
 *         description: Erro de validação
 *       409:
 *         description: Email já cadastrado
 */
router.post('/register', (0, audit_1.auditLog)('REGISTER_USER', 'User'), authController.register.bind(authController));
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login do usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', (0, audit_1.auditLog)('LOGIN_USER', 'User'), authController.login.bind(authController));
exports.default = router;
