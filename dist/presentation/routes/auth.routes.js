"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const audit_1 = require("../middlewares/audit");
const router = (0, express_1.Router)();
const authController = new AuthController_1.AuthController();
console.log('Rotas de autenticação carregadas');
// Rotas públicas com auditoria
router.post('/register', (0, audit_1.auditLog)('REGISTER_USER', 'User'), authController.register.bind(authController));
router.post('/login', (0, audit_1.auditLog)('LOGIN_USER', 'User'), authController.login.bind(authController));
exports.default = router;
