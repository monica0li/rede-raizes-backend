import { Request, Response } from 'express';
import { OrderService, CreateOrderDTO } from '../../application/services/OrderService';

const orderService = new OrderService();

export class OrderController {
  async create(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { unitId, channel, items, usePoints } = req.body;

      if (!unitId) {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'O campo "unitId" é obrigatório',
          details: [{ field: 'unitId', issue: 'Campo obrigatório' }],
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      if (!channel || channel.trim() === '') {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'O campo "channel" é obrigatório',
          details: [{ field: 'channel', issue: 'Campo obrigatório' }],
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'O campo "items" é obrigatório e deve conter pelo menos um item',
          details: [{ field: 'items', issue: 'Deve conter pelo menos um item' }],
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      const data: CreateOrderDTO = {
        userId,
        unitId,
        channel: channel.toUpperCase(),
        items,
        usePoints: usePoints || 0
      };

      const order = await orderService.createOrder(data);
      return res.status(201).json(order);
    } catch (error: any) {
      console.error('Erro ao criar pedido:', error.message);

      if (error.message.includes('Usuário') && error.message.includes('não encontrado')) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: error.message,
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      if (error.message.includes('Unidade') && error.message.includes('inativa')) {
        return res.status(409).json({
          error: 'CONFLICT',
          message: error.message,
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      if (error.message.includes('Unidade') && error.message.includes('não encontrada')) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: error.message,
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      if (error.message.includes('Canal inválido')) {
        const invalidChannel = error.message.split('"')[1] || '';
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: error.message,
          details: [
            {
              field: 'channel',
              issue: `"${invalidChannel}" não é um canal válido. Use: APP, TOTEM, BALCAO, PICKUP ou WEB`
            }
          ],
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      if (error.message.includes('Estoque insuficiente')) {
        return res.status(409).json({
          error: 'CONFLICT',
          message: error.message,
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      if (error.message.includes('não encontrado') || error.message.includes('não pertence')) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: error.message,
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      if (error.message.includes('está inativo')) {
        return res.status(409).json({
          error: 'CONFLICT',
          message: error.message,
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      if (error.message.includes('Pontos insuficientes') || error.message.includes('programa de fidelidade')) {
        return res.status(409).json({
          error: 'CONFLICT',
          message: error.message,
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Erro ao criar pedido',
        timestamp: new Date().toISOString(),
        path: req.originalUrl || req.path
      });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const channel = req.query.channel as string;
      const status = req.query.status as string;

      const filterUserId = userRole === 'ADMIN' ? undefined : userId;

      const orders = await orderService.findOrders(filterUserId, channel, status);
      return res.status(200).json(orders);
    } catch (error) {
      console.error('Erro ao listar pedidos:', error);
      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao listar pedidos',
        timestamp: new Date().toISOString(),
        path: req.originalUrl || req.path
      });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);

      if (isNaN(id)) {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'ID inválido',
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      const order = await orderService.findById(id);

      if (!order) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: `Pedido com ID ${id} não encontrado`,
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      if (req.user!.role !== 'ADMIN' && order.userId !== req.user!.id) {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: 'Você não tem permissão para ver este pedido',
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      return res.status(200).json(order);
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao buscar pedido',
        timestamp: new Date().toISOString(),
        path: req.originalUrl || req.path
      });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const { status } = req.body;

      if (isNaN(id)) {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'ID inválido',
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      if (!status || status.trim() === '') {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'O campo "status" é obrigatório',
          details: [{ field: 'status', issue: 'Campo obrigatório' }],
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      const order = await orderService.updateStatus(
        id,
        status,
        req.user!.id,
        req.user!.role
      );

      return res.status(200).json(order);
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error.message);

      if (error.message.includes('Status inválido')) {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: error.message,
          details: [
            {
              field: 'status',
              issue: 'Use: AGUARDANDO_PAGAMENTO, PAGO, PREPARANDO, PRONTO, ENTREGUE ou CANCELADO'
            }
          ],
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      if (error.message.includes('não tem permissão') || 
          error.message.includes('Apenas administradores')) {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: error.message,
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      if (error.message === 'Pedido não encontrado') {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: error.message,
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      if (error.message.includes('já está cancelado') || 
          error.message.includes('já foi entregue') ||
          error.message.includes('já pago') ||
          error.message.includes('Não é possível confirmar entrega') ||
          error.message.includes('não foi pago')) {
        return res.status(409).json({
          error: 'CONFLICT',
          message: error.message,
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Erro ao atualizar status',
        timestamp: new Date().toISOString(),
        path: req.originalUrl || req.path
      });
    }
  }

  async cancel(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);

      if (isNaN(id)) {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'ID inválido',
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      const order = await orderService.cancelOrder(
        id,
        req.user!.id,
        req.user!.role
      );

      return res.status(200).json({
        message: 'Pedido cancelado com sucesso',
        order
      });
    } catch (error: any) {
      console.error('Erro ao cancelar pedido:', error.message);

      if (error.message === 'Pedido não encontrado') {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: error.message,
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      if (error.message.includes('permissão') || 
          error.message.includes('apenas administradores')) {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: error.message,
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      if (error.message.includes('já entregue') || 
          error.message.includes('já pago') || 
          error.message.includes('já está cancelado')) {
        return res.status(409).json({
          error: 'CONFLICT',
          message: error.message,
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Erro ao cancelar pedido',
        timestamp: new Date().toISOString(),
        path: req.originalUrl || req.path
      });
    }
  }
}