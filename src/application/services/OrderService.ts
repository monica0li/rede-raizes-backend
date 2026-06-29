import { prisma } from '../../config/prisma';

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
  async createOrder(data: CreateOrderDTO) {
    //validar canal
    const validChannels = ['APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB'];
    if (!validChannels.includes(data.channel.toUpperCase())) {
      throw new Error(`Canal inválido: "${data.channel}". Use: APP, TOTEM, BALCAO, PICKUP ou WEB`);
    }

    //validar exstencia do usuário
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
    let total = 0;
    const orderItems: OrderItemData[] = [];

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
      total += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        total: itemTotal
      });
    }

    //criar o pedido
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: data.userId,
          unitId: data.unitId,
          channel: data.channel.toUpperCase(),
          total: total,
          status: 'AGUARDANDO_PAGAMENTO'
        }
      });

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

        await tx.stock.update({
          where: { productId: item.productId },
          data: {
            quantity: {
              decrement: item.quantity
            }
          }
        });
      }

      return newOrder;
    });

    return await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: { product: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        },
        unit: true
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

    //cliente só altera os próprios pedidos
    if (userRole !== 'ADMIN' && order.userId !== userId) {
      throw new Error('Você não tem permissão para alterar o status deste pedido');
    }

    //pedido cancelado não pode ser alterado
    if (order.status === 'CANCELADO') {
      throw new Error('Pedido já está cancelado. Não é possível alterar o status.');
    }

    //pedido entregue não pode ser alterado
    if (order.status === 'ENTREGUE') {
      throw new Error('Pedido já foi entregue. Não é possível alterar o status.');
    }

    //regras para não admin
    if (userRole !== 'ADMIN') {
      const statusUpper = status.toUpperCase();

      if (statusUpper === 'ENTREGUE') {
        if (order.status === 'AGUARDANDO_PAGAMENTO') {
          throw new Error('Pedido ainda não foi pago. Não é possível confirmar entrega.');
        }
        if (order.status === 'CANCELADO') {
          throw new Error('Pedido cancelado não pode ser entregue');
        }
      }
      else {
        throw new Error(`Apenas administradores podem alterar o status para "${statusUpper}"`);
      }
    }

    //admin pode mudar para qualquer status (desde que não cancelado/entregue)
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

    //cliente só pode cancelar seus próprios pedidos
    if (order.userId !== userId && userRole !== 'ADMIN') {
      throw new Error('Você não tem permissão para cancelar este pedido');
    }

    //validações que não permitem cancelar
    if (order.status === 'CANCELADO') {
      throw new Error('Pedido já está cancelado');
    }
    if (order.status === 'ENTREGUE') {
      throw new Error('Pedido já entregue não pode ser cancelado');
    }

    return await prisma.$transaction(async (tx) => {
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

      return await tx.order.update({
        where: { id },
        data: { status: 'CANCELADO' },
        include: {
          items: {
            include: { product: true }
          }
        }
      });
    });
  }
}