"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.adminMiddleware = adminMiddleware;
const jwt_1 = require("../../utils/jwt");
function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                error: 'UNAUTHORIZED',
                message: 'Token não fornecido. Use: Bearer <token>',
                timestamp: new Date().toISOString(),
                path: req.originalUrl || req.path
            });
        }
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                error: 'UNAUTHORIZED',
                message: 'Formato do token inválido. Use: Bearer <token>',
                timestamp: new Date().toISOString(),
                path: req.originalUrl || req.path
            });
        }
        const token = parts[1];
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        return next();
    }
    catch (error) {
        return res.status(401).json({
            error: 'UNAUTHORIZED',
            message: 'Token inválido ou expirado',
            timestamp: new Date().toISOString(),
            path: req.originalUrl || req.path
        });
    }
}
function adminMiddleware(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            error: 'UNAUTHORIZED',
            message: 'Usuário não autenticado',
            timestamp: new Date().toISOString(),
            path: req.originalUrl || req.path
        });
    }
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
            error: 'FORBIDDEN',
            message: 'Acesso negado. Permissão de administrador necessária.',
            timestamp: new Date().toISOString(),
            path: req.originalUrl || req.path
        });
    }
    return next();
}
