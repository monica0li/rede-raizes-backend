"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const prisma_1 = require("../../config/prisma");
class ProductService {
    async create(data) {
        try {
            console.log('ProductService.create recebeu:', data);
            // Validações
            if (!data.name || data.name.trim() === '') {
                throw new Error('Nome é obrigatório');
            }
            if (data.price <= 0) {
                throw new Error('Preço deve ser maior que zero');
            }
            if (!data.unitId) {
                throw new Error('Unidade é obrigatória');
            }
            // erificar se a unidade existe (independente de estar ativa)
            const unit = await prisma_1.prisma.unit.findUnique({
                where: { id: data.unitId }
            });
            if (!unit) {
                throw new Error(`Unidade com ID ${data.unitId} não encontrada`);
            }
            // erificar se a unidade está ativa
            if (!unit.active) {
                throw new Error(`Unidade "${unit.name}" está inativa. Não é possível criar produtos.`);
            }
            console.log('Unidade encontrada:', unit.id, unit.name);
            // Criar o produto
            const product = await prisma_1.prisma.product.create({
                data: {
                    name: data.name.trim(),
                    description: data.description?.trim() || null,
                    price: data.price,
                    unitId: data.unitId,
                    active: true
                },
                include: {
                    unit: true,
                    stock: true
                }
            });
            console.log('Produto criado:', product.id, product.name);
            return product;
        }
        catch (error) {
            console.error('Erro no ProductService.create:', error);
            throw error;
        }
    }
    async findAll(unitId, includeInactive = false) {
        try {
            const where = {};
            if (unitId) {
                where.unitId = unitId;
            }
            if (!includeInactive) {
                where.active = true;
            }
            return await prisma_1.prisma.product.findMany({
                where,
                include: {
                    unit: true,
                    stock: true
                },
                orderBy: { name: 'asc' }
            });
        }
        catch (error) {
            console.error('Erro ao listar produtos:', error);
            throw error;
        }
    }
    async findById(id) {
        try {
            return await prisma_1.prisma.product.findUnique({
                where: { id },
                include: {
                    unit: true,
                    stock: true
                }
            });
        }
        catch (error) {
            console.error('Erro ao buscar produto:', error);
            throw error;
        }
    }
    async update(id, data) {
        try {
            const product = await prisma_1.prisma.product.findUnique({ where: { id } });
            if (!product) {
                throw new Error('Produto não encontrado');
            }
            const updateData = {};
            if (data.name !== undefined) {
                if (data.name.trim() === '') {
                    throw new Error('Nome não pode estar vazio');
                }
                updateData.name = data.name.trim();
            }
            if (data.price !== undefined) {
                if (data.price <= 0) {
                    throw new Error('Preço deve ser maior que zero');
                }
                updateData.price = data.price;
            }
            if (data.description !== undefined) {
                updateData.description = data.description?.trim() || null;
            }
            if (data.unitId !== undefined) {
                const unit = await prisma_1.prisma.unit.findUnique({
                    where: { id: data.unitId, active: true }
                });
                if (!unit) {
                    throw new Error(`Unidade com ID ${data.unitId} não encontrada ou inativa`);
                }
                updateData.unitId = data.unitId;
            }
            return await prisma_1.prisma.product.update({
                where: { id },
                data: updateData,
                include: {
                    unit: true,
                    stock: true
                }
            });
        }
        catch (error) {
            console.error('Erro ao atualizar produto:', error);
            throw error;
        }
    }
    //soft delete (inativar)
    async delete(id) {
        try {
            const product = await prisma_1.prisma.product.findUnique({ where: { id } });
            if (!product) {
                throw new Error('Produto não encontrado');
            }
            return await prisma_1.prisma.product.update({
                where: { id },
                data: { active: false },
                include: {
                    unit: true,
                    stock: true
                }
            });
        }
        catch (error) {
            console.error('Erro ao inativar produto:', error);
            throw error;
        }
    }
    //reativar
    async reactivate(id) {
        try {
            const product = await prisma_1.prisma.product.findUnique({ where: { id } });
            if (!product) {
                throw new Error('Produto não encontrado');
            }
            return await prisma_1.prisma.product.update({
                where: { id },
                data: { active: true },
                include: {
                    unit: true,
                    stock: true
                }
            });
        }
        catch (error) {
            console.error('Erro ao reativar produto:', error);
            throw error;
        }
    }
}
exports.ProductService = ProductService;
