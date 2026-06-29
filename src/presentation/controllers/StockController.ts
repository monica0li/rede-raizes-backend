import { Request, Response } from 'express';
import { StockService } from '../../application/services/StockService';

const stockService = new StockService();

export class StockController {
  async addStock(req: Request, res: Response) {
    try {
      const { productId, unitId, quantity } = req.body;

      if (!productId) {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'O campo "productId" é obrigatório',
          details: [{ field: 'productId', issue: 'Campo obrigatório' }],
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      if (!unitId) {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'O campo "unitId" é obrigatório',
          details: [{ field: 'unitId', issue: 'Campo obrigatório' }],
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      if (!quantity || quantity <= 0) {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'O campo "quantity" é obrigatório e deve ser maior que zero',
          details: [{ field: 'quantity', issue: 'Deve ser maior que zero' }],
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      const stock = await stockService.addStock(productId, unitId, quantity);
      return res.status(200).json({
        message: `Estoque atualizado com sucesso! +${quantity} unidades`,
        stock
      });
    } catch (error: any) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: error.message,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      if (error.message.includes('quantidade') || error.message.includes('pertence')) {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: error.message,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Erro ao adicionar estoque',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }

  async getStock(req: Request, res: Response) {
    try {
      const productId = parseInt(req.params.productId as string);

      if (isNaN(productId)) {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'ID do produto inválido',
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      const stock = await stockService.getStock(productId);

      if (!stock) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: `Estoque não encontrado para o produto ${productId}`,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      return res.status(200).json(stock);
    } catch (error) {
      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao buscar estoque',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }

  async updateStock(req: Request, res: Response) {
    try {
      const productId = parseInt(req.params.productId as string);
      const { quantity, unitId } = req.body;

      if (isNaN(productId)) {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'ID do produto inválido',
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      if (quantity === undefined || quantity === null) {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'O campo "quantity" é obrigatório',
          details: [{ field: 'quantity', issue: 'Campo obrigatório' }],
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      if (quantity < 0) {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'A quantidade não pode ser negativa',
          details: [{ field: 'quantity', issue: 'Não pode ser negativa' }],
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      const stock = await stockService.updateStock(productId, quantity, unitId);
      return res.status(200).json({
        message: `Estoque atualizado com sucesso! Nova quantidade: ${quantity}`,
        stock
      });
    } catch (error: any) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: error.message,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      if (error.message.includes('quantidade')) {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: error.message,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao atualizar estoque',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }
}