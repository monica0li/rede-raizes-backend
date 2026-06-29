import { prisma } from '../../config/prisma';

export class PaymentService {
  async processPayment(
    orderId: number,
    paymentMethod: string = 'MOCK',
    forceStatus?: 'APROVADO' | 'RECUSADO'
  ) {
    //buscar o pedido
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    if (order.status === 'CANCELADO') {
      throw new Error('Pedido cancelado não pode ser pago');
    }

    if (order.status === 'ENTREGUE') {
      throw new Error('Pedido já entregue');
    }

    if (order.status === 'PAGO') {
      throw new Error('Pedido já foi pago');
    }

    //verificar tentativas anteriores
    const previousAttempts = await prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' }
    });

    const lastAttempt = previousAttempts.length > 0 ? previousAttempts[0] : null;
    
    if (lastAttempt && lastAttempt.status === 'APROVADO') {
      throw new Error('Pedido já foi pago');
    }

    //simular processamento
    console.log(`⏳ Processando pagamento do pedido ${orderId}...`);
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

    //determinar o resultado
    let approved: boolean;
    //forçar status para teste, se fornecido
    if (forceStatus === 'APROVADO') {
      approved = true;
      console.log('🔒 Forçando APROVAÇÃO (teste)');
    } else if (forceStatus === 'RECUSADO') {
      approved = false;
      console.log('🔒 Forçando RECUSA (teste)');
    } else {
      const random = Math.random();
      approved = random < 0.8;
      console.log(`📊 Resultado aleatório: ${approved ? 'APROVADO ✅' : 'RECUSADO ❌'} (${(random * 100).toFixed(0)}%)`);
    }

    const paymentStatus = approved ? 'APROVADO' : 'RECUSADO';
    const orderStatus = approved ? 'PAGO' : 'AGUARDANDO_PAGAMENTO';
    const transactionId = approved
      ? `mock-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      : null;

    //registrar tentativa de pagamento
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.total,
        status: paymentStatus,
        transactionId: transactionId
      }
    });

    //atualizar o pedido
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: orderStatus,
        paymentStatus: paymentStatus,
        externalPaymentId: transactionId
      },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
        unit: true,
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    console.log(`Pagamento do pedido ${orderId} finalizado`);

    return {
      success: approved,
      payment,
      order: updatedOrder,
      message: approved
        ? 'Pagamento aprovado com sucesso!'
        : 'Pagamento recusado. Tente novamente.',
      previousAttempts: previousAttempts.length,
      lastAttempt: lastAttempt ? {
        status: lastAttempt.status,
        date: lastAttempt.createdAt
      } : null
    };
  }

  async getPaymentByOrderId(orderId: number) {
    return await prisma.payment.findMany({
      where: { orderId },
      include: { order: true },
      orderBy: { createdAt: 'desc' }
    });
  }
}