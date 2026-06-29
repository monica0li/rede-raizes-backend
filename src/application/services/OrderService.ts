import { prisma } from '../../config/prisma';
import { PromotionService } from './PromotionService';
import { LoyaltyService } from './LoyaltyService';

export interface CreateOrderItemDTO {
  productId: number;
  quantity: number;
}

export interface CreateOrderDTO {
  userId: number;
  unitId: number;
  channel: string;
  items: CreateOrderItemDTO[];
}

interface OrderItemData {
  productId: number;
  quantity: number;
  unitPrice: number;
  total: number;
}

export class OrderService {
  private promotionService: PromotionService;
  private loyaltyService: LoyaltyService;

  constructor() {
    this.promotionService = new PromotionService();
    this.loyaltyService = new LoyaltyService();
  }

  async createOrder(data: CreateOrderDTO) {
    // validar canal
    const validChannels = ['APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB'];
    if (!validChannels.includes(data.channel.toUpperCase())) {
      throw new Error(`Canal inválido: "${data.channel}". Use: APP, TOTEM, BALCAO, PICKUP ou WEB`);
    }

    //validar existência do usuário
    const user = await prisma.user.findUnique({
      where: { id: data.userId }
    });

    if (!user) {
      throw new Error(`Usuário com ID ${data.userId} não encontrado`);
    }

    //validar se unidade existe e está ativa
    const unit = await prisma.unit.findUnique({
      where: { id: data.unitId }
    });

    if (!unit) {
      throw new Error(`Unidade com ID ${data.unitId} não encontrada`);
    }

    if (!unit.active) {
      throw new Error(`Unidade "${unit.name}" está inativa. Não é possível criar pedidos.`);
    }

    //buscar produtos e validar estoque
    let subtotal = 0;
    const orderItems: OrderItemData[] = [];
    const productIds: number[] = [];

    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { stock: true }
      });

      if (!product) {
        throw new Error(`Produto ${item.productId} não encontrado`);
      }

      if (!product.active) {
        throw new Error(`Produto "${product.name}" está inativo`);
      }

      if (product.unitId !== data.unitId) {
        throw new Error(`Produto "${product.name}" não pertence a esta unidade`);
      }

      if (!product.stock || product.stock.quantity < item.quantity) {
        throw new Error(`Estoque insuficiente para "${product.name}". Disponível: ${product.stock?.quantity || 0}`);
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        total: itemTotal
      });

      productIds.push(product.id);
    }

    // aplicar promoções
    const promotionResult = await this.promotionService.applyPromotions(
      productIds,
      subtotal,
      data.unitId
    );

    //calcular total final (subtotal - desconto)
    const finalTotal = Math.round((subtotal - promotionResult.totalDiscount) * 100) / 100;

    // criar o pedido em transação
    const order = await prisma.$transaction(async (tx) => {
      //criar o pedido
      const newOrder = await tx.order.create({
        data: {
          userId: data.userId,
          unitId: data.unitId,
          channel: data.channel.toUpperCase(),
          total: finalTotal,
          status: 'AGUARDANDO_PAGAMENTO',
        }
      });

      //criar os itens do pedido
      for (const item of orderItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total
          }
        });

        //atualizar estoque
        await tx.stock.update({
          where: { productId: item.productId },
          data: {
            quantity: {
              decrement: item.quantity
            }
          }
        });
      }

      //registrar promoções aplicadas
      if (promotionResult.appliedPromotions.length > 0) {
        console.log(`Promoções aplicadas no pedido ${newOrder.id}:`, promotionResult.appliedPromotions);
      }

      return newOrder;
    });

    //adicionar pontos de fidelidade após pedido criado
    await this.loyaltyService.earnPoints(data.userId, order.id, finalTotal);

    //buscar pedido completo
    return await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: { product: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        },
        unit: true,
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  async findOrders(userId?: number, channel?: string, status?: string) {
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (channel) {
      where.channel = channel.toUpperCase();
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    return await prisma.order.findMany({
      where,
      include: {
        items: {
          include: { product: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        },
        unit: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: number) {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        },
        unit: true,
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  async updateStatus(id: number, status: string, userId: number, userRole: string) {
    const validStatus = ['AGUARDANDO_PAGAMENTO', 'PAGO', 'PREPARANDO', 'PRONTO', 'ENTREGUE', 'CANCELADO'];
    if (!validStatus.includes(status.toUpperCase())) {
      throw new Error(`Status inválido: "${status}". Use: AGUARDANDO_PAGAMENTO, PAGO, PREPARANDO, PRONTO, ENTREGUE ou CANCELADO`);
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    // Cliente só altera os próprios pedidos
    if (userRole !== 'ADMIN' && order.userId !== userId) {
      throw new Error('Você não tem permissão para alterar o status deste pedido');
    }

    // Pedido cancelado não pode ser alterado
    if (order.status === 'CANCELADO') {
      throw new Error('Pedido já está cancelado. Não é possível alterar o status.');
    }

    // Pedido entregue não pode ser alterado
    if (order.status === 'ENTREGUE') {
      throw new Error('Pedido já foi entregue. Não é possível alterar o status.');
    }

    // Regras para não admin
    if (userRole !== 'ADMIN') {
      const statusUpper = status.toUpperCase();

      // Cliente pode CANCELAR (mesmo se pago - permite solicitação)
      if (statusUpper === 'CANCELADO') {
        // Cliente pode cancelar em qualquer situação, exceto se já entregue

      }
      // Cliente pode confirmar ENTREGA
      else if (statusUpper === 'ENTREGUE') {
        if (order.status === 'AGUARDANDO_PAGAMENTO') {
          throw new Error('Pedido ainda não foi pago. Não é possível confirmar entrega.');
        }
        if (order.status === 'CANCELADO') {
          throw new Error('Pedido cancelado não pode ser entregue');
        }
      }
      // Cliente NÃO pode mudar para outros status (PAGO, PREPARANDO, PRONTO)
      else {
        throw new Error(`Apenas administradores podem alterar o status para "${statusUpper}"`);
      }
    }

    // Admin pode mudar para qualquer status (desde que não cancelado/entregue)
    return await prisma.order.update({
      where: { id },
      data: { status: status.toUpperCase() },
      include: {
        items: {
          include: { product: true }
        }
      }
    });
  }

  async cancelOrder(id: number, userId: number, userRole: string) {
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    // Cliente só pode cancelar seus próprios pedidos
    if (order.userId !== userId && userRole !== 'ADMIN') {
      throw new Error('Você não tem permissão para cancelar este pedido');
    }

    // Validações que não permitem cancelar
    if (order.status === 'CANCELADO') {
      throw new Error('Pedido já está cancelado');
    }
    if (order.status === 'ENTREGUE') {
      throw new Error('Pedido já entregue não pode ser cancelado');
    }

    // CLIENTE PODE CANCELAR MESMO SE PAGO

    return await prisma.$transaction(async (tx) => {
      // Devolver o estoque
      const items = await tx.orderItem.findMany({
        where: { orderId: id }
      });

      for (const item of items) {
        await tx.stock.update({
          where: { productId: item.productId },
          data: {
            quantity: {
              increment: item.quantity
            }
          }
        });
      }

      // Atualizar status do pedido
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: 'CANCELADO' },
        include: {
          items: {
            include: { product: true }
          }
        }
      });
      return updatedOrder;
    });
  }
}