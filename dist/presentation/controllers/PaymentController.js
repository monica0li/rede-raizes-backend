"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const PaymentService_1 = require("../../application/services/PaymentService");
const prisma_1 = require("../../config/prisma");
const paymentService = new PaymentService_1.PaymentService();
class PaymentController {
    async processPayment(req, res) {
        try {
            const { orderId, paymentMethod, forceStatus } = req.body;
            console.log(`📨 Solicitação de pagamento para pedido ${orderId}`);
            if (!orderId) {
                return res.status(422).json({
                    error: 'VALIDATION_ERROR',
                    message: 'O campo "orderId" é obrigatório',
                    details: [{ field: 'orderId', issue: 'Campo obrigatório' }],
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }
            // Verificar se o pedido existe
            const order = await prisma_1.prisma.order.findUnique({
                where: { id: orderId }
            });
            if (!order) {
                return res.status(404).json({
                    error: 'NOT_FOUND',
                    message: `Pedido com ID ${orderId} não encontrado`,
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }
            // Verificar permissão
            if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
                return res.status(403).json({
                    error: 'FORBIDDEN',
                    message: 'Você não tem permissão para pagar este pedido',
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }
            // Verificar se o pedido já foi pago
            if (order.status === 'PAGO') {
                return res.status(409).json({
                    error: 'CONFLICT',
                    message: `Pedido ${orderId} já foi pago. Não é possível processar novamente.`,
                    details: [
                        {
                            field: 'orderId',
                            issue: `Status atual: ${order.status}. Pagamento já realizado.`
                        }
                    ],
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }
            // Processar pagamento
            const result = await paymentService.processPayment(orderId, paymentMethod || 'MOCK', forceStatus);
            return res.status(200).json(result);
        }
        catch (error) {
            console.error('Erro no pagamento:', error.message);
            if (error.message === 'Pedido não encontrado') {
                return res.status(404).json({
                    error: 'NOT_FOUND',
                    message: error.message,
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }
            if (error.message.includes('cancelado') ||
                error.message.includes('entregue') ||
                error.message.includes('já foi pago')) {
                return res.status(409).json({
                    error: 'CONFLICT',
                    message: error.message,
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }
            return res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: error.message || 'Erro ao processar pagamento',
                timestamp: new Date().toISOString(),
                path: req.path
            });
        }
    }
    async getPaymentStatus(req, res) {
        try {
            const orderId = parseInt(req.params.orderId);
            if (isNaN(orderId)) {
                return res.status(422).json({
                    error: 'VALIDATION_ERROR',
                    message: 'ID do pedido inválido',
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }
            // Buscar o pedido com seus pagamentos
            const order = await prisma_1.prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    payments: {
                        orderBy: { createdAt: 'desc' }
                    },
                    user: { select: { id: true, name: true, email: true } },
                    unit: true,
                    items: { include: { product: true } }
                }
            });
            if (!order) {
                return res.status(404).json({
                    error: 'NOT_FOUND',
                    message: `Pedido com ID ${orderId} não encontrado`,
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }
            // Verificar permissão
            if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
                return res.status(403).json({
                    error: 'FORBIDDEN',
                    message: 'Você não tem permissão para ver este pedido',
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }
            // Retornar organizado
            return res.status(200).json({
                order: {
                    id: order.id,
                    status: order.status,
                    total: order.total,
                    channel: order.channel,
                    createdAt: order.createdAt
                },
                paymentHistory: order.payments.map((p) => ({
                    id: p.id,
                    status: p.status,
                    amount: p.amount,
                    transactionId: p.transactionId,
                    createdAt: p.createdAt
                })),
                totalAttempts: order.payments.length,
                lastAttempt: order.payments.length > 0 ? order.payments[0] : null,
                customer: {
                    id: order.user.id,
                    name: order.user.name,
                    email: order.user.email
                },
                unit: {
                    id: order.unit.id,
                    name: order.unit.name
                },
                items: order.items.map((item) => ({
                    id: item.id,
                    product: item.product.name,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    total: item.total
                }))
            });
        }
        catch (error) {
            console.error('Erro ao buscar status:', error);
            return res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: 'Erro ao buscar status do pagamento',
                timestamp: new Date().toISOString(),
                path: req.path
            });
        }
    }
}
exports.PaymentController = PaymentController;
