"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitService = void 0;
const prisma_1 = require("../../config/prisma");
class UnitService {
    async create(data) {
        if (!data.name || data.name.trim() === '') {
            throw new Error('Nome é obrigatório');
        }
        if (!data.address || data.address.trim() === '') {
            throw new Error('Endereço é obrigatório');
        }
        return await prisma_1.prisma.unit.create({
            data: {
                name: data.name.trim(),
                address: data.address.trim(),
                active: true
            }
        });
    }
    async findAll() {
        return await prisma_1.prisma.unit.findMany({
            where: { active: true },
            orderBy: { name: 'asc' }
        });
    }
    async findAllIncludingInactive() {
        return await prisma_1.prisma.unit.findMany({
            orderBy: { name: 'asc' }
        });
    }
    async findById(id) {
        return await prisma_1.prisma.unit.findUnique({
            where: { id },
            include: {
                products: {
                    where: { active: true }
                }
            }
        });
    }
    async update(id, data) {
        const unit = await prisma_1.prisma.unit.findUnique({ where: { id } });
        if (!unit) {
            throw new Error('Unidade não encontrada');
        }
        if (data.name !== undefined && data.name.trim() === '') {
            throw new Error('Nome não pode estar vazio');
        }
        if (data.address !== undefined && data.address.trim() === '') {
            throw new Error('Endereço não pode estar vazio');
        }
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name.trim();
        if (data.address !== undefined)
            updateData.address = data.address.trim();
        return await prisma_1.prisma.unit.update({
            where: { id },
            data: updateData
        });
    }
    // Soft delete (inativar)
    async delete(id) {
        const unit = await prisma_1.prisma.unit.findUnique({ where: { id } });
        if (!unit) {
            throw new Error('Unidade não encontrada');
        }
        return await prisma_1.prisma.unit.update({
            where: { id },
            data: { active: false }
        });
    }
    // Reativar
    async reactivate(id) {
        const unit = await prisma_1.prisma.unit.findUnique({ where: { id } });
        if (!unit) {
            throw new Error('Unidade não encontrada');
        }
        return await prisma_1.prisma.unit.update({
            where: { id },
            data: { active: true }
        });
    }
}
exports.UnitService = UnitService;
