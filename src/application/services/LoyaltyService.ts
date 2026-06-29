import { prisma } from '../../config/prisma';

export class LoyaltyService {
  // configuração de pontos
  private POINTS_PER_REAL = 1; // 1 ponto por R$ 1,00
  private POINTS_TO_CASH_RATE = 0.10; // 1 ponto = R$ 0,10


  // adicionar pontos ao fazer pedido
  async earnPoints(userId: number, orderId: number, total: number) {
    const points = Math.floor(total * this.POINTS_PER_REAL);

    if (points <= 0) return { loyalty: null, pointsEarned: 0 };

    // atualizar ou criar loyalty
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

    // registrar transação
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

  // resgatar pontos (aplicar desconto)
  async redeemPoints(userId: number, pointsToRedeem: number, orderId?: number) {
    const loyalty = await prisma.loyalty.findUnique({
      where: { userId }
    });

    if (!loyalty) {
      throw new Error('Usuário não possui programa de fidelidade');
    }

    if (loyalty.points < pointsToRedeem) {
      throw new Error(`Pontos insuficientes. Você tem ${loyalty.points} pontos.`);
    }

    if (pointsToRedeem <= 0) {
      throw new Error('A quantidade de pontos para resgate deve ser maior que zero');
    }

    // calcular valor do desconto
    const discount = pointsToRedeem * this.POINTS_TO_CASH_RATE;

    // atualizar pontos
    const updated = await prisma.$transaction(async (tx) => {
      const updatedLoyalty = await tx.loyalty.update({
        where: { userId },
        data: {
          points: { decrement: pointsToRedeem }
        }
      });

      // registrar transação
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
  }

  // consultar saldo de pontos
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
        message: 'Usuário não possui programa de fidelidade'
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

  // obter histórico completo
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

  // reverter pontos (ao cancelar pedido)
  async reversePoints(userId: number, orderId: number) {
    // buscar transação de EARN relacionada ao pedido
    const transaction = await prisma.loyaltyTransaction.findFirst({
      where: {
        orderId,
        type: 'EARN'
      }
    });

    if (!transaction) {
      return { success: false, message: 'Nenhum ponto encontrado para este pedido' };
    }

    // reverter pontos
    const loyalty = await prisma.loyalty.update({
      where: { userId },
      data: {
        points: { decrement: transaction.points }
      }
    });

    // registrar reversão
    await prisma.loyaltyTransaction.create({
      data: {
        loyaltyId: loyalty.id,
        type: 'REVERSE',
        points: transaction.points,
        description: `Reversão de pontos - Pedido #${orderId} cancelado`,
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