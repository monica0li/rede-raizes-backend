"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionService = void 0;
const prisma_1 = require("../../config/prisma");
class PromotionService {
    // Aplicar promoções a um pedido
    async applyPromotions(productIds, subtotal, unitId) {
        const now = new Date();
        let totalDiscount = 0;
        const appliedPromotions = [];
        // Buscar promoções ativas
        const promotions = await prisma_1.prisma.promotion.findMany({
            where: {
                active: true,
                startDate: { lte: now },
                endDate: { gte: now }
            },
            include: {
                products: true
            }
        });
        for (const promo of promotions) {
            // Verificar se a promoção tem produtos específicos
            const promoProductIds = promo.products.map((p) => p.productId);
            // Se tem produtos específicos, verifica se algum produto do pedido está na promoção
            if (promoProductIds.length > 0) {
                const hasMatchingProduct = productIds.some(id => promoProductIds.includes(id));
                if (!hasMatchingProduct)
                    continue;
            }
            // Verificar valor mínimo do pedido
            if (promo.minOrderValue && subtotal < promo.minOrderValue)
                continue;
            // Calcular desconto
            let discount = 0;
            if (promo.type === 'PERCENTUAL') {
                discount = subtotal * (promo.value / 100);
            }
            else if (promo.type === 'FIXO') {
                discount = Math.min(promo.value, subtotal);
            }
            // Aplicar desconto
            if (discount > 0) {
                totalDiscount += discount;
                appliedPromotions.push({
                    id: promo.id,
                    name: promo.name,
                    type: promo.type,
                    value: promo.value,
                    discount: Math.round(discount * 100) / 100
                });
                break; // Apenas uma promoção por pedido
            }
        }
        return {
            totalDiscount: Math.round(totalDiscount * 100) / 100,
            appliedPromotions,
            finalTotal: Math.round((subtotal - totalDiscount) * 100) / 100
        };
    }
    async create(data) {
        const { productIds, ...promotionData } = data;
        // Validar datas
        if (data.startDate >= data.endDate) {
            throw new Error('A data de início deve ser anterior à data de fim');
        }
        // Verificar se produtos existem
        if (productIds && productIds.length > 0) {
            const products = await prisma_1.prisma.product.findMany({
                where: { id: { in: productIds } }
            });
            if (products.length !== productIds.length) {
                throw new Error('Um ou mais produtos não encontrados');
            }
        }
        return await prisma_1.prisma.$transaction(async (tx) => {
            // Criar promoção
            const promotion = await tx.promotion.create({
                data: {
                    name: data.name,
                    description: data.description,
                    type: data.type,
                    value: data.value,
                    minOrderValue: data.minOrderValue,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    active: true
                }
            });
            // Adicionar produtos à promoção
            if (productIds && productIds.length > 0) {
                await tx.productPromotion.createMany({
                    data: productIds.map(productId => ({
                        productId,
                        promotionId: promotion.id
                    }))
                });
            }
            return await tx.promotion.findUnique({
                where: { id: promotion.id },
                include: {
                    products: {
                        include: { product: true }
                    }
                }
            });
        });
    }
    async findAll(activeOnly = false) {
        const where = {};
        if (activeOnly) {
            const now = new Date();
            where.active = true;
            where.startDate = { lte: now };
            where.endDate = { gte: now };
        }
        return await prisma_1.prisma.promotion.findMany({
            where,
            include: {
                products: {
                    include: { product: true }
                }
            },
            orderBy: { startDate: 'desc' }
        });
    }
    async findById(id) {
        return await prisma_1.prisma.promotion.findUnique({
            where: { id },
            include: {
                products: {
                    include: { product: true }
                }
            }
        });
    }
    async update(id, data) {
        const promotion = await prisma_1.prisma.promotion.findUnique({ where: { id } });
        if (!promotion) {
            throw new Error('Promoção não encontrada');
        }
        const { productIds, ...updateData } = data;
        // Validar datas se ambas forem fornecidas
        if (updateData.startDate && updateData.endDate && updateData.startDate >= updateData.endDate) {
            throw new Error('A data de início deve ser anterior à data de fim');
        }
        return await prisma_1.prisma.$transaction(async (tx) => {
            // Atualizar promoção
            const updated = await tx.promotion.update({
                where: { id },
                data: updateData
            });
            // Atualizar produtos da promoção
            if (productIds !== undefined) {
                // Remover produtos antigos
                await tx.productPromotion.deleteMany({
                    where: { promotionId: id }
                });
                // Adicionar novos produtos
                if (productIds.length > 0) {
                    await tx.productPromotion.createMany({
                        data: productIds.map(productId => ({
                            productId,
                            promotionId: id
                        }))
                    });
                }
            }
            return await tx.promotion.findUnique({
                where: { id },
                include: {
                    products: {
                        include: { product: true }
                    }
                }
            });
        });
    }
    async delete(id) {
        const promotion = await prisma_1.prisma.promotion.findUnique({ where: { id } });
        if (!promotion) {
            throw new Error('Promoção não encontrada');
        }
        // Soft delete
        return await prisma_1.prisma.promotion.update({
            where: { id },
            data: { active: false }
        });
    }
    async reactivate(id) {
        const promotion = await prisma_1.prisma.promotion.findUnique({ where: { id } });
        if (!promotion) {
            throw new Error('Promoção não encontrada');
        }
        return await prisma_1.prisma.promotion.update({
            where: { id },
            data: { active: true }
        });
    }
}
exports.PromotionService = PromotionService;
