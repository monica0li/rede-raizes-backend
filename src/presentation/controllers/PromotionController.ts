import { Request, Response } from 'express';
import { PromotionService, CreatePromotionDTO, UpdatePromotionDTO } from '../../application/services/PromotionService';
import { AuditService } from '../../application/services/AuditService';

const promotionService = new PromotionService();
const auditService = new AuditService();

export class PromotionController {
  async getActive(req: Request, res: Response) {
    try {
      const promotions = await promotionService.findAll(true);
      return res.status(200).json(promotions);
    } catch (error) {
      console.error('Erro ao listar promocoes ativas:', error);
      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao listar promocoes ativas',
        timestamp: new Date().toISOString(),
        path: req.originalUrl || req.path
      });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data: CreatePromotionDTO = req.body;

      if (!data.name || data.name.trim() === '') {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'O campo "name" e obrigatorio',
          details: [{ field: 'name', issue: 'Campo obrigatorio' }],
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      if (!data.type || !['PERCENTUAL', 'FIXO'].includes(data.type)) {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'O campo "type" deve ser PERCENTUAL ou FIXO',
          details: [{ field: 'type', issue: 'Tipo invalido' }],
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      if (!data.value || data.value <= 0) {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'O campo "value" e obrigatorio e deve ser maior que zero',
          details: [{ field: 'value', issue: 'Deve ser maior que zero' }],
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      if (!data.startDate || !data.endDate) {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'Os campos "startDate" e "endDate" sao obrigatorios',
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      const promotion = await promotionService.create(data);

      if (promotion) {
        await auditService.logPromotionApplication(req.user!.id, promotion.id, {
          action: 'CREATE',
          data: data
        });
      }

      return res.status(201).json(promotion);
    } catch (error: any) {
      console.error('Erro ao criar promocao:', error);

      if (error.message.includes('data de inicio')) {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: error.message,
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      if (error.message.includes('produtos nao encontrados')) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: error.message,
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao criar promocao',
        timestamp: new Date().toISOString(),
        path: req.originalUrl || req.path
      });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const promotions = await promotionService.findAll(false);
      return res.status(200).json(promotions);
    } catch (error) {
      console.error('Erro ao listar promocoes:', error);
      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao listar promocoes',
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
          message: 'ID invalido',
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      const promotion = await promotionService.findById(id);

      if (!promotion) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: `Promocao com ID ${id} nao encontrada`,
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      return res.status(200).json(promotion);
    } catch (error) {
      console.error('Erro ao buscar promocao:', error);
      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao buscar promocao',
        timestamp: new Date().toISOString(),
        path: req.originalUrl || req.path
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);

      if (isNaN(id)) {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'ID invalido',
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      const data: UpdatePromotionDTO = req.body;
      const promotion = await promotionService.update(id, data);

      if (promotion) {
        await auditService.logPromotionApplication(req.user!.id, promotion.id, {
          action: 'UPDATE',
          data: data
        });
      }

      return res.status(200).json(promotion);
    } catch (error: any) {
      console.error('Erro ao atualizar promocao:', error);

      if (error.message === 'Promocao nao encontrada') {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: error.message,
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      if (error.message.includes('data de inicio')) {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: error.message,
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao atualizar promocao',
        timestamp: new Date().toISOString(),
        path: req.originalUrl || req.path
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);

      if (isNaN(id)) {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'ID invalido',
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      const promotion = await promotionService.delete(id);

      if (promotion) {
        await auditService.logPromotionApplication(req.user!.id, promotion.id, {
          action: 'DELETE',
          data: { active: false }
        });
      }

      return res.status(200).json({
        message: `Promocao "${promotion?.name}" inativada com sucesso`,
        promotion
      });
    } catch (error: any) {
      console.error('Erro ao inativar promocao:', error);

      if (error.message === 'Promocao nao encontrada') {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: error.message,
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao inativar promocao',
        timestamp: new Date().toISOString(),
        path: req.originalUrl || req.path
      });
    }
  }

  async reactivate(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);

      if (isNaN(id)) {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'ID invalido',
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      const promotion = await promotionService.reactivate(id);

      if (promotion) {
        await auditService.logPromotionApplication(req.user!.id, promotion.id, {
          action: 'REACTIVATE',
          data: { active: true }
        });
      }

      return res.status(200).json({
        message: `Promocao "${promotion?.name}" reativada com sucesso`,
        promotion
      });
    } catch (error: any) {
      console.error('Erro ao reativar promocao:', error);

      if (error.message === 'Promocao nao encontrada') {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: error.message,
          timestamp: new Date().toISOString(),
          path: req.originalUrl || req.path
        });
      }

      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao reativar promocao',
        timestamp: new Date().toISOString(),
        path: req.originalUrl || req.path
      });
    }
  }
}