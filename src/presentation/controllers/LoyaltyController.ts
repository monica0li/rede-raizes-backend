import { Request, Response } from 'express';
import { LoyaltyService } from '../../application/services/LoyaltyService';

const loyaltyService = new LoyaltyService();

export class LoyaltyController {
  async getBalance(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const balance = await loyaltyService.getBalance(userId);
      return res.status(200).json(balance);
    } catch (error) {
      console.error('Erro ao consultar saldo:', error);
      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao consultar saldo de pontos',
        timestamp: new Date().toISOString(),
        path: req.originalUrl || req.path
      });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const history = await loyaltyService.getHistory(userId, limit);
      return res.status(200).json(history);
    } catch (error) {
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