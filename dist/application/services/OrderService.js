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
        // 1. Validar canal
        const validChannels = ['APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB'];
        if (!validChannels.includes(data.channel.toUpperCase())) {
            throw new Error(`Canal inválido: "${data.channel}". Use: APP, TOTEM, BALCAO, PICKUP ou WEB`);
        }
        // 2. Validar existência do usuário
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: data.userId }
        });
        if (!user) {
            throw new Error(`Usuário com ID ${data.userId} não encontrado`);
        }
        // 3. Validar se unidade existe e está ativa
        const unit = await prisma_1.prisma.unit.findUnique({
            where: { id: data.unitId }
        });
        if (!unit) {
            throw new Error(`Unidade com ID ${data.unitId} não encontrada`);
        }
        if (!unit.active) {
            throw new Error(`Unidade "${unit.name}" está inativa. Não é possível criar pedidos.`);
        }
        // 4. Buscar produtos e validar estoque
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
        // 5. Aplicar promoções
        const promotionResult = await this.promotionService.applyPromotions(productIds, subtotal, data.unitId);
        // 6. Calcular total final (subtotal - desconto)
        const finalTotal = Math.round((subtotal - promotionResult.totalDiscount) * 100) / 100;
        // 7. Criar o pedido em transação
        const order = await prisma_1.prisma.$transaction(async (tx) => {
            // 7.1 Criar o pedido
            const newOrder = await tx.order.create({
                data: {
                    userId: data.userId,
                    unitId: data.unitId,
                    channel: data.channel.toUpperCase(),
                    total: finalTotal,
                    status: 'AGUARDANDO_PAGAMENTO',
                    // Armazenar dados da promoção como JSON (opcional)
                    // promotionApplied: JSON.stringify(promotionResult)
                }
            });
            // 7.2 Criar os itens do pedido
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
                // 7.3 Atualizar estoque
                await tx.stock.update({
                    where: { productId: item.productId },
                    data: {
                        quantity: {
                            decrement: item.quantity
                        }
                    }
                });
            }
            // 7.4 Registrar promoções aplicadas (em uma tabela separada, se existir)
            // Aqui você pode criar registros em uma tabela OrderPromotion se tiver
            if (promotionResult.appliedPromotions.length > 0) {
                // Exemplo: salvar em um campo JSON ou criar registros
                console.log(`Promoções aplicadas no pedido ${newOrder.id}:`, promotionResult.appliedPromotions);
            }
            return newOrder;
        });
        // 8. Adicionar pontos de fidelidade (após pedido criado)
        await this.loyaltyService.earnPoints(data.userId, order.id, finalTotal);
        // 9. Registrar auditoria (criação de pedido)
        // O middleware de auditoria já faz isso, mas podemos chamar diretamente se necessário
        // 10. Buscar pedido completo
        return await prisma_1.prisma.order.findUnique({
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
                // (a validação de ENTREGUE já foi feita acima)
                // Permitido!
            }
            // Cliente pode confirmar ENTREGA
            else if (statusUpper === 'ENTREGUE') {
                if (order.status === 'AGUARDANDO_PAGAMENTO') {
                    throw new Error('Pedido ainda não foi pago. Não é possível confirmar entrega.');
                }
                if (order.status === 'CANCELADO') {
                    throw new Error('Pedido cancelado não pode ser entregue');
                }
                // Permitido!
            }
            // Cliente NÃO pode mudar para outros status (PAGO, PREPARANDO, PRONTO)
            else {
                throw new Error(`Apenas administradores podem alterar o status para "${statusUpper}"`);
            }
        }
        // Admin pode mudar para qualquer status (desde que não cancelado/entregue)
        return await prisma_1.prisma.order.update({
            where: { id },
            data: { status: status.toUpperCase() },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });
    }
    async cancelOrder(id, userId, userRole) {
        const order = await prisma_1.prisma.order.findUnique({ where: { id } });
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
        // CLIENTE PODE CANCELAR MESMO SE PAGO (removemos a restrição)
        return await prisma_1.prisma.$transaction(async (tx) => {
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
            // MPORTANTE: Devolver pontos de fidelidade se o pedido tiver gerado pontos
            // Isso deve ser feito aqui se você armazenar os pontos ganhos por pedido
            // await this.loyaltyService.reversePoints(order.userId, id);
            return updatedOrder;
        });
    }
}
exports.OrderService = OrderService;
