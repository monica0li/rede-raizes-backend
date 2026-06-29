"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const prisma_1 = require("../../config/prisma");
class PaymentService {
    async processPayment(orderId, paymentMethod = 'MOCK', forceStatus) {
        // 1. Buscar o pedido
        const order = await prisma_1.prisma.order.findUnique({
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
        // 2. Verificar tentativas anteriores
        const previousAttempts = await prisma_1.prisma.payment.findMany({
            where: { orderId },
            orderBy: { createdAt: 'desc' }
        });
        const lastAttempt = previousAttempts.length > 0 ? previousAttempts[0] : null;
        if (lastAttempt && lastAttempt.status === 'APROVADO') {
            throw new Error('Pedido já foi pago');
        }
        // 3. Simular processamento
        console.log(`⏳ Processando pagamento do pedido ${orderId}...`);
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
        // 4. Determinar o resultado
        let approved;
        if (forceStatus === 'APROVADO') {
            approved = true;
            console.log('🔒 Forçando APROVAÇÃO (teste)');
        }
        else if (forceStatus === 'RECUSADO') {
            approved = false;
            console.log('🔒 Forçando RECUSA (teste)');
        }
        else {
            const random = Math.random();
            approved = random < 0.8;
            console.log(`📊 Resultado aleatório: ${approved ? 'APROVADO ✅' : 'RECUSADO ❌'} (${(random * 100).toFixed(0)}%)`);
        }
        const paymentStatus = approved ? 'APROVADO' : 'RECUSADO';
        const orderStatus = approved ? 'PAGO' : 'AGUARDANDO_PAGAMENTO';
        const transactionId = approved
            ? `mock-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
            : null;
        // 5. Registrar tentativa de pagamento
        const payment = await prisma_1.prisma.payment.create({
            data: {
                orderId: order.id,
                amount: order.total,
                status: paymentStatus,
                transactionId: transactionId
            }
        });
        // 6. Atualizar o pedido
        const updatedOrder = await prisma_1.prisma.order.update({
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
        console.log(`Pagamento do pedido ${orderId} finalizado!`);
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
    async getPaymentByOrderId(orderId) {
        return await prisma_1.prisma.payment.findMany({
            where: { orderId },
            include: { order: true },
            orderBy: { createdAt: 'desc' }
        });
    }
}
exports.PaymentService = PaymentService;
