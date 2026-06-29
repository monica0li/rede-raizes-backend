import { prisma } from '../../config/prisma';

export interface AuditLogData {
  userId?: number;
  action: string;
  entity: string;
  entityId?: number;
  oldValue?: any;
  newValue?: any;
  metadata?: any;
}

export class AuditService {
  // metodo generico de log
  async log(data: AuditLogData) {
    try {
      return await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          oldValue: data.oldValue ? JSON.stringify(data.oldValue) : null,
          newValue: data.newValue ? JSON.stringify(data.newValue) : null,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null
        }
      });
    } catch (error) {
      console.error('Erro ao registrar auditoria:', error);
      return null;
    }
  }

  // metodo especifico para Promocoes
  async logPromotionApplication(userId: number, promotionId: number, data: any) {
    return this.log({
      userId,
      action: 'PROMOTION_APPLICATION',
      entity: 'Promotion',
      entityId: promotionId,
      newValue: data
    });
  }

  // metodo especifico para Fidelidade
  async logLoyaltyRedemption(userId: number, data: any) {
    return this.log({
      userId,
      action: 'LOYALTY_REDEMPTION',
      entity: 'Loyalty',
      newValue: data
    });
  }

  // metodos para consultas
  async getLogs(
    filters: {
      userId?: number;
      action?: string;
      entity?: string;
      startDate?: Date;
      endDate?: Date;
    },
    page: number = 1,
    limit: number = 20
  ) {
    const where: any = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.entity) where.entity = filters.entity;
    if (filters.startDate) where.createdAt = { gte: filters.startDate };
    if (filters.endDate) where.createdAt = { ...where.createdAt, lte: filters.endDate };

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.auditLog.count({ where })
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getLogsByOrder(orderId: number) {
    return await prisma.auditLog.findMany({
      where: {
        entity: 'Order',
        entityId: orderId
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async getLogsByUser(userId: number, limit: number = 20) {
    return await prisma.auditLog.findMany({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }
}