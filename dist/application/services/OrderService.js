"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const prisma_1 = require("../../config/prisma");
const PromotionService_1 = require("./PromotionService");
const LoyaltyService_1 = require("./LoyaltyService");
class OrderService {
    constructor() {
        this.promotionService = new PromotionService_1.PromotionService();
        this.loyaltyService = new LoyaltyService_1.LoyaltyService();
    }
    async createOrder(data) {
        const validChannels = ['APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB'];
        if (!validChannels.includes(data.channel.toUpperCase())) {
            throw new Error(`Canal inválido: "${data.channel}". Use: APP, TOTEM, BALCAO, PICKUP ou WEB`);
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: data.userId }
        });
        if (!user) {
            throw new Error(`Usuário com ID ${data.userId} não encontrado`);
        }
        const unit = await prisma_1.prisma.unit.findUnique({
            where: { id: data.unitId }
        });
        if (!unit) {
            throw new Error(`Unidade com ID ${data.unitId} não encontrada`);
        }
        if (!unit.active) {
            throw new Error(`Unidade "${unit.name}" está inativa. Não é possível criar pedidos.`);
        }
        let subtotal = 0;
        const orderItems = [];
        const productIds = [];
        for (const item of data.items) {
            const product = await prisma_1.prisma.product.findUnique({
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
        const promotionResult = await this.promotionService.applyPromotions(productIds, subtotal, data.unitId);
        let finalTotal = Math.round((subtotal - promotionResult.totalDiscount) * 100) / 100;
        let pointsDiscount = 0;
        let pointsUsed = 0;
        if (data.usePoints && data.usePoints > 0) {
            const loyalty = await prisma_1.prisma.loyalty.findUnique({
                where: { userId: data.userId }
            });
            if (loyalty && loyalty.points >= data.usePoints) {
                pointsUsed = data.usePoints;
                pointsDiscount = pointsUsed * 0.10;
                if (pointsDiscount > finalTotal) {
                    pointsDiscount = finalTotal;
                    pointsUsed = Math.floor(pointsDiscount / 0.10);
                }
                finalTotal = Math.round((finalTotal - pointsDiscount) * 100) / 100;
            }
            else if (loyalty) {
                throw new Error(`Pontos insuficientes. Você tem ${loyalty.points} pontos.`);
            }
            else {
                throw new Error('Usuário não possui programa de fidelidade.');
            }
        }
        const order = await prisma_1.prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    userId: data.userId,
                    unitId: data.unitId,
                    channel: data.channel.toUpperCase(),
                    total: finalTotal,
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
            if (promotionResult.appliedPromotions.length > 0) {
                console.log(`Promoções aplicadas no pedido ${newOrder.id}:`, promotionResult.appliedPromotions);
            }
            if (pointsUsed > 0) {
                await tx.loyalty.update({
                    where: { userId: data.userId },
                    data: {
                        points: {
                            decrement: pointsUsed
                        }
                    }
                });
                const loyalty = await tx.loyalty.findUnique({
                    where: { userId: data.userId }
                });
                if (loyalty) {
                    await tx.loyaltyTransaction.create({
                        data: {
                            loyaltyId: loyalty.id,
                            type: 'REDEEM',
                            points: pointsUsed,
                            description: `Resgate de ${pointsUsed} pontos - Pedido #${newOrder.id}`,
                            orderId: newOrder.id
                        }
                    });
                }
            }
            return newOrder;
        });
        // buscar o pedido completo
        const orderData = await prisma_1.prisma.order.findUnique({
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
        // montar resposta com detalhes dos descontos
        const totalDiscount = Math.round((promotionResult.totalDiscount + pointsDiscount) * 100) / 100;
        const response = {
            ...orderData,
            originalSubtotal: Math.round(subtotal * 100) / 100,
            discountBreakdown: {
                promotions: promotionResult.appliedPromotions.map(p => ({
                    id: p.id,
                    name: p.name,
                    type: p.type,
                    value: p.value,
                    discountAmount: p.discount
                })),
                points: {
                    used: pointsUsed,
                    discountAmount: Math.round(pointsDiscount * 100) / 100
                },
                totalDiscount: totalDiscount,
                finalTotal: finalTotal
            }
        };
        return response;
    }
    async findOrders(userId, channel, status) {
        const where = {};
        if (userId) {
            where.userId = userId;
        }
        if (channel) {
            where.channel = channel.toUpperCase();
        }
        if (status) {
            where.status = status.toUpperCase();
        }
        return await prisma_1.prisma.order.findMany({
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
    async findById(id) {
        return await prisma_1.prisma.order.findUnique({
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
    async updateStatus(id, status, userId, userRole) {
        const validStatus = ['AGUARDANDO_PAGAMENTO', 'PAGO', 'PREPARANDO', 'PRONTO', 'ENTREGUE', 'CANCELADO'];
        if (!validStatus.includes(status.toUpperCase())) {
            throw new Error(`Status inválido: "${status}". Use: AGUARDANDO_PAGAMENTO, PAGO, PREPARANDO, PRONTO, ENTREGUE ou CANCELADO`);
        }
        const order = await prisma_1.prisma.order.findUnique({ where: { id } });
        if (!order) {
            throw new Error('Pedido não encontrado');
        }
        if (userRole !== 'ADMIN' && order.userId !== userId) {
            throw new Error('Você não tem permissão para alterar o status deste pedido');
        }
        if (order.status === 'CANCELADO') {
            throw new Error('Pedido já está cancelado. Não é possível alterar o status.');
        }
        if (order.status === 'ENTREGUE') {
            throw new Error('Pedido já foi entregue. Não é possível alterar o status.');
        }
        const shouldCreditPoints = status.toUpperCase() === 'ENTREGUE' && order.status !== 'ENTREGUE';
        const updatedOrder = await prisma_1.prisma.order.update({
            where: { id },
            data: { status: status.toUpperCase() },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });
        if (shouldCreditPoints) {
            await this.loyaltyService.earnPoints(order.userId, order.id, order.total);
        }
        return updatedOrder;
    }
    async cancelOrder(id, userId, userRole) {
        const order = await prisma_1.prisma.order.findUnique({ where: { id } });
        if (!order) {
            throw new Error('Pedido não encontrado');
        }
        if (order.userId !== userId && userRole !== 'ADMIN') {
            throw new Error('Você não tem permissão para cancelar este pedido');
        }
        if (order.status === 'CANCELADO') {
            throw new Error('Pedido já está cancelado');
        }
        if (order.status === 'ENTREGUE') {
            throw new Error('Pedido já entregue não pode ser cancelado');
        }
        return await prisma_1.prisma.$transaction(async (tx) => {
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
exports.OrderService = OrderService;
