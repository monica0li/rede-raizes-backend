"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockService = void 0;
const prisma_1 = require("../../config/prisma");
class StockService {
    async addStock(productId, unitId, quantity) {
        //verifica se o produto existe
        const product = await prisma_1.prisma.product.findUnique({
            where: { id: productId },
            include: { stock: true }
        });
        if (!product) {
            throw new Error(`Produto com ID ${productId} não encontrado`);
        }
        if (product.unitId !== unitId) {
            throw new Error(`Produto "${product.name}" não pertence à unidade ${unitId}`);
        }
        if (quantity <= 0) {
            throw new Error('A quantidade deve ser maior que zero');
        }
        //se já tem estoque, atualiza. Se não, cria.
        if (product.stock) {
            return await prisma_1.prisma.stock.update({
                where: { productId: productId },
                data: {
                    quantity: {
                        increment: quantity
                    }
                }
            });
        }
        else {
            return await prisma_1.prisma.stock.create({
                data: {
                    productId: productId,
                    unitId: unitId,
                    quantity: quantity
                }
            });
        }
    }
    async getStock(productId) {
        return await prisma_1.prisma.stock.findUnique({
            where: { productId: productId },
            include: { product: true, unit: true }
        });
    }
    async updateStock(productId, quantity, unitId) {
        // verifica se o produto existe
        const product = await prisma_1.prisma.product.findUnique({
            where: { id: productId }
        });
        if (!product) {
            throw new Error(`Produto com ID ${productId} não encontrado`);
        }
        if (quantity < 0) {
            throw new Error('A quantidade não pode ser negativa');
        }
        // verifica se o estoque existe
        const existingStock = await prisma_1.prisma.stock.findUnique({
            where: { productId }
        });
        if (!existingStock) {
            //se não existe, cria um novo
            return await prisma_1.prisma.stock.create({
                data: {
                    productId,
                    unitId: unitId || product.unitId,
                    quantity
                }
            });
        }
        //atualizar estoque
        return await prisma_1.prisma.stock.update({
            where: { productId },
            data: { quantity }
        });
    }
}
exports.StockService = StockService;
