"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const prisma_1 = require("../../config/prisma");
class AuditService {
    // metodo generico de log
    async log(data) {
        try {
            return await prisma_1.prisma.auditLog.create({
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
        }
        catch (error) {
            console.error('Erro ao registrar auditoria:', error);
            return null;
        }
    }
    // metodo especifico para Promocoes
    async logPromotionApplication(userId, promotionId, data) {
        return this.log({
            userId,
            action: 'PROMOTION_APPLICATION',
            entity: 'Promotion',
            entityId: promotionId,
            newValue: data
        });
    }
    // metodo especifico para Fidelidade
    async logLoyaltyRedemption(userId, data) {
        return this.log({
            userId,
            action: 'LOYALTY_REDEMPTION',
            entity: 'Loyalty',
            newValue: data
        });
    }
    // metodos para consultas
    async getLogs(filters, page = 1, limit = 20) {
        const where = {};
        if (filters.userId)
            where.userId = filters.userId;
        if (filters.action)
            where.action = filters.action;
        if (filters.entity)
            where.entity = filters.entity;
        if (filters.startDate)
            where.createdAt = { gte: filters.startDate };
        if (filters.endDate)
            where.createdAt = { ...where.createdAt, lte: filters.endDate };
        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            prisma_1.prisma.auditLog.findMany({
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
            prisma_1.prisma.auditLog.count({ where })
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
    async getLogsByOrder(orderId) {
        return await prisma_1.prisma.auditLog.findMany({
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
    async getLogsByUser(userId, limit = 20) {
        return await prisma_1.prisma.auditLog.findMany({
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
exports.AuditService = AuditService;
