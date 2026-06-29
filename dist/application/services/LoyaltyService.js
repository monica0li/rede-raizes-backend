"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoyaltyService = void 0;
const prisma_1 = require("../../config/prisma");
class LoyaltyService {
    constructor() {
        this.POINTS_PER_REAL = 1;
    }
    async earnPoints(userId, orderId, total) {
        const points = Math.floor(total * this.POINTS_PER_REAL);
        if (points <= 0)
            return { loyalty: null, pointsEarned: 0 };
        const loyalty = await prisma_1.prisma.loyalty.upsert({
            where: { userId },
            update: {
                points: { increment: points }
            },
            create: {
                userId,
                points
            }
        });
        await prisma_1.prisma.loyaltyTransaction.create({
            data: {
                loyaltyId: loyalty.id,
                type: 'EARN',
                points,
                description: `Pedido #${orderId} - R$ ${total.toFixed(2)}`,
                orderId
            }
        });
        return { loyalty, pointsEarned: points };
    }
    async getBalance(userId) {
        const loyalty = await prisma_1.prisma.loyalty.findUnique({
            where: { userId },
            include: {
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                }
            }
        });
        if (!loyalty) {
            return {
                userId,
                points: 0,
                transactions: [],
                message: 'Usuario nao possui programa de fidelidade'
            };
        }
        return {
            userId,
            points: loyalty.points,
            transactions: loyalty.transactions,
            totalEarned: loyalty.transactions
                .filter(t => t.type === 'EARN')
                .reduce((sum, t) => sum + t.points, 0),
            totalRedeemed: loyalty.transactions
                .filter(t => t.type === 'REDEEM')
                .reduce((sum, t) => sum + t.points, 0)
        };
    }
    async getHistory(userId, limit = 50) {
        const loyalty = await prisma_1.prisma.loyalty.findUnique({
            where: { userId }
        });
        if (!loyalty) {
            return { userId, points: 0, transactions: [] };
        }
        const transactions = await prisma_1.prisma.loyaltyTransaction.findMany({
            where: { loyaltyId: loyalty.id },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                order: {
                    select: { id: true, total: true, status: true }
                }
            }
        });
        return {
            userId,
            currentBalance: loyalty.points,
            transactions
        };
    }
    async reversePoints(userId, orderId) {
        const transaction = await prisma_1.prisma.loyaltyTransaction.findFirst({
            where: {
                orderId,
                type: 'EARN'
            }
        });
        if (!transaction) {
            return { success: false, message: 'Nenhum ponto encontrado para este pedido' };
        }
        const loyalty = await prisma_1.prisma.loyalty.update({
            where: { userId },
            data: {
                points: { decrement: transaction.points }
            }
        });
        await prisma_1.prisma.loyaltyTransaction.create({
            data: {
                loyaltyId: loyalty.id,
                type: 'REVERSE',
                points: transaction.points,
                description: `Reversao de pontos - Pedido #${orderId} cancelado`,
                orderId
            }
        });
        return {
            success: true,
            pointsReversed: transaction.points,
            newBalance: loyalty.points
        };
    }
}
exports.LoyaltyService = LoyaltyService;
