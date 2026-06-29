import { Request, Response } from 'express';
import { LoyaltyService } from '../../application/services/LoyaltyService';
import { AuditService } from '../../application/services/AuditService';

const loyaltyService = new LoyaltyService();
const auditService = new AuditService();

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

  async redeemPoints(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { points, orderId } = req.body;

      console.log('Redeem points request:', { userId, points, orderId });

      if (!points || points <= 0) {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'O campo "points" e obrigatorio e deve ser maior que zero',
          details: [{ field: 'points', issue: 'Deve ser maior que zero' }],
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      const result = await loyaltyService.redeemPoints(userId, points, orderId);

      await auditService.log({
        userId,
        action: 'LOYALTY_REDEMPTION',
        entity: 'Loyalty',
        newValue: {
          pointsRedeemed: points,
          discount: result.discount,
          newBalance: result.newBalance
        }
      });

      return res.status(200).json({
        message: 'Pontos resgatados com sucesso!',
        ...result
      });
    } catch (error: any) {
      console.error('Erro ao resgatar pontos:', error);

      if (error.message.includes('Pontos insuficientes')) {
        return res.status(409).json({
          error: 'CONFLICT',
          message: error.message,
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      if (error.message.includes('nao possui programa de fidelidade')) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: error.message,
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Erro ao resgatar pontos',
        timestamp: new Date().toISOString(),
        path: req.originalUrl || req.path
      });
    }
  }
}