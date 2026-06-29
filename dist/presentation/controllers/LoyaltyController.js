"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoyaltyController = void 0;
const LoyaltyService_1 = require("../../application/services/LoyaltyService");
const loyaltyService = new LoyaltyService_1.LoyaltyService();
class LoyaltyController {
    async getBalance(req, res) {
        try {
            const userId = req.user.id;
            const balance = await loyaltyService.getBalance(userId);
            return res.status(200).json(balance);
        }
        catch (error) {
            console.error('Erro ao consultar saldo:', error);
            return res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: 'Erro ao consultar saldo de pontos',
                timestamp: new Date().toISOString(),
                path: req.originalUrl || req.path
            });
        }
    }
    async getHistory(req, res) {
        try {
            const userId = req.user.id;
            const limit = req.query.limit ? parseInt(req.query.limit) : 50;
            const history = await loyaltyService.getHistory(userId, limit);
            return res.status(200).json(history);
        }
        catch (error) {
            console.error('Erro ao consultar historico:', error);
            return res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: 'Erro ao consultar historico de pontos',
                timestamp: new Date().toISOString(),
                path: req.originalUrl || req.path
            });
        }
    }
}
exports.LoyaltyController = LoyaltyController;
