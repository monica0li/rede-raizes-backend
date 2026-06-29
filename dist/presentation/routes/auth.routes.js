"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const router = (0, express_1.Router)();
const authController = new AuthController_1.AuthController();
console.log('🚀 Rotas de autenticação carregadas!');
// Rotas públicas
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
exports.default = router;
