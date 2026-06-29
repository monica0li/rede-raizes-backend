"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditController = void 0;
const AuditService_1 = require("../../application/services/AuditService");
const auditService = new AuditService_1.AuditService();
class AuditController {
    async getLogs(req, res) {
        try {
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 20;
            const userId = req.query.userId ? parseInt(req.query.userId) : undefined;
            const action = req.query.action;
            const entity = req.query.entity;
            const startDate = req.query.startDate ? new Date(req.query.startDate) : undefined;
            const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined;
            const result = await auditService.getLogs({ userId, action, entity, startDate, endDate }, page, limit);
            return res.status(200).json(result);
        }
        catch (error) {
            console.error('Erro ao listar logs:', error);
            return res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: 'Erro ao listar logs de auditoria',
                timestamp: new Date().toISOString(),
                path: req.originalUrl || req.path
            });
        }
    }
    async getLogsByOrder(req, res) {
        try {
            const orderId = parseInt(req.params.orderId);
            if (isNaN(orderId)) {
                return res.status(422).json({
                    error: 'VALIDATION_ERROR',
                    message: 'ID do pedido inválido',
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl || req.path
                });
            }
            const logs = await auditService.getLogsByOrder(orderId);
            return res.status(200).json(logs);
        }
        catch (error) {
            console.error('Erro ao buscar logs do pedido:', error);
            return res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: 'Erro ao buscar logs do pedido',
                timestamp: new Date().toISOString(),
                path: req.originalUrl || req.path
            });
        }
    }
    async getLogsByUser(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            if (isNaN(userId)) {
                return res.status(422).json({
                    error: 'VALIDATION_ERROR',
                    message: 'ID do usuário inválido',
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl || req.path
                });
            }
            const limit = req.query.limit ? parseInt(req.query.limit) : 20;
            const logs = await auditService.getLogsByUser(userId, limit);
            return res.status(200).json(logs);
        }
        catch (error) {
            console.error('Erro ao buscar logs do usuário:', error);
            return res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: 'Erro ao buscar logs do usuário',
                timestamp: new Date().toISOString(),
                path: req.originalUrl || req.path
            });
        }
    }
}
exports.AuditController = AuditController;
