import { prisma } from '../../config/prisma';

export class LoyaltyService {
  private POINTS_PER_REAL = 1;
  private POINTS_TO_CASH_RATE = 0.10;

  async earnPoints(userId: number, orderId: number, total: number) {
    const points = Math.floor(total * this.POINTS_PER_REAL);

    if (points <= 0) return { loyalty: null, pointsEarned: 0 };

    const loyalty = await prisma.loyalty.upsert({
      where: { userId },
      update: {
        points: { increment: points }
      },
      create: {
        userId,
        points
      }
    });

    await prisma.loyaltyTransaction.create({
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

  async redeemPoints(userId: number, pointsToRedeem: number, orderId?: number) {
    try {
      const loyalty = await prisma.loyalty.findUnique({
        where: { userId }
      });

      if (!loyalty) {
        throw new Error('Usuario nao possui programa de fidelidade');
      }

      if (loyalty.points < pointsToRedeem) {
        throw new Error(`Pontos insuficientes. Voce tem ${loyalty.points} pontos.`);
      }

      if (pointsToRedeem <= 0) {
        throw new Error('A quantidade de pontos para resgate deve ser maior que zero');
      }

      const discount = pointsToRedeem * this.POINTS_TO_CASH_RATE;

      const updated = await prisma.$transaction(async (tx) => {
        const updatedLoyalty = await tx.loyalty.update({
          where: { userId },
          data: {
            points: { decrement: pointsToRedeem }
          }
        });

        await tx.loyaltyTransaction.create({
          data: {
            loyaltyId: loyalty.id,
            type: 'REDEEM',
            points: pointsToRedeem,
            description: `Resgate de ${pointsToRedeem} pontos - Desconto de R$ ${discount.toFixed(2)}${orderId ? ` (Pedido #${orderId})` : ''}`,
            orderId: orderId || null
          }
        });

        return updatedLoyalty;
      });

      return {
        newBalance: updated.points,
        pointsRedeemed: pointsToRedeem,
        discount: Math.round(discount * 100) / 100
      };
    } catch (error: any) {
      console.error('Erro no redeemPoints:', error);
      throw error;
    }
  }

  async getBalance(userId: number) {
    const loyalty = await prisma.loyalty.findUnique({
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

  async getHistory(userId: number, limit: number = 50) {
    const loyalty = await prisma.loyalty.findUnique({
      where: { userId }
    });

    if (!loyalty) {
      return { userId, points: 0, transactions: [] };
    }

    const transactions = await prisma.loyaltyTransaction.findMany({
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

  async reversePoints(userId: number, orderId: number) {
    const transaction = await prisma.loyaltyTransaction.findFirst({
      where: {
        orderId,
        type: 'EARN'
      }
    });

    if (!transaction) {
      return { success: false, message: 'Nenhum ponto encontrado para este pedido' };
    }

    const loyalty = await prisma.loyalty.update({
      where: { userId },
      data: {
        points: { decrement: transaction.points }
      }
    });

    await prisma.loyaltyTransaction.create({
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