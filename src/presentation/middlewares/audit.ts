import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../../application/services/AuditService';

const auditService = new AuditService();

// Middleware para registrar ações sensíveis
export function auditLog(action: string, entity: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Salvar dados originais para depois comparar
    const originalSend = res.send;
    const startTime = Date.now();

    res.send = function (body: any) {
      // Registrar após a resposta
      try {
        const userId = req.user?.id;
        let entityId: number | undefined;
        
        if (req.params.id) {
          const parsed = parseInt(req.params.id as string);
          if (!isNaN(parsed)) {
            entityId = parsed;
          }
        } else if (req.body?.id) {
          const parsed = parseInt(req.body.id);
          if (!isNaN(parsed)) {
            entityId = parsed;
          }
        }

        const metadata = {
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          method: req.method,
          path: req.path,
          duration: Date.now() - startTime
        };

        auditService.log({
          userId,
          action,
          entity,
          entityId,
          oldValue: req.body,
          newValue: body,
          metadata
        });
      } catch (error) {
        console.error('Erro no audit middleware:', error);
      }

      return originalSend.call(this, body);
    };

    next();
  };
}