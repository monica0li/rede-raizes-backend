"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const AuthService_1 = require("../../application/services/AuthService");
const authService = new AuthService_1.AuthService();
class AuthController {
    async register(req, res) {
        try {
            console.log('📥 AuthController.register recebeu:', req.body);
            const data = req.body;
            // Validações básicas
            if (!data.email || !data.password || !data.name) {
                return res.status(422).json({
                    error: 'VALIDATION_ERROR',
                    message: 'Email, senha e nome são obrigatórios',
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl || req.path
                });
            }
            // Validação extra de role (caso o usuário tenha enviado)
            if (data.role) {
                const roleUpper = data.role.toUpperCase();
                if (!AuthService_1.VALID_ROLES.includes(roleUpper)) {
                    return res.status(422).json({
                        error: 'VALIDATION_ERROR',
                        message: `Role inválida: "${data.role}". Roles permitidas: ${AuthService_1.VALID_ROLES.join(', ')}`,
                        details: [
                            {
                                field: 'role',
                                issue: `"${data.role}" não é uma role válida. Use: ${AuthService_1.VALID_ROLES.join(', ')}`
                            }
                        ],
                        timestamp: new Date().toISOString(),
                        path: req.originalUrl || req.path
                    });
                }
            }
            const result = await authService.register(data);
            return res.status(201).json(result);
        }
        catch (error) {
            console.error('ERRO no AuthController.register:', error.message);
            if (error.message === 'Email já cadastrado') {
                return res.status(409).json({
                    error: 'CONFLICT',
                    message: error.message,
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl || req.path
                });
            }
            if (error.message.includes('Role inválida')) {
                return res.status(422).json({
                    error: 'VALIDATION_ERROR',
                    message: error.message,
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl || req.path
                });
            }
            return res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: error.message || 'Erro ao cadastrar usuário',
                timestamp: new Date().toISOString(),
                path: req.originalUrl || req.path
            });
        }
    }
    async login(req, res) {
        try {
            const data = req.body;
            if (!data.email || !data.password) {
                return res.status(422).json({
                    error: 'VALIDATION_ERROR',
                    message: 'Email e senha são obrigatórios',
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl || req.path
                });
            }
            const result = await authService.login(data);
            return res.status(200).json(result);
        }
        catch (error) {
            console.error('Erro no login:', error);
            if (error.message === 'Email ou senha inválidos') {
                return res.status(401).json({
                    error: 'UNAUTHORIZED',
                    message: error.message,
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl || req.path
                });
            }
            return res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: 'Erro ao fazer login',
                timestamp: new Date().toISOString(),
                path: req.originalUrl || req.path
            });
        }
    }
}
exports.AuthController = AuthController;
