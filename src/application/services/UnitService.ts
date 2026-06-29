import { prisma } from '../../config/prisma';
import { Unit } from '@prisma/client';

export interface CreateUnitDTO {
  name: string;
  address: string;
}

export interface UpdateUnitDTO {
  name?: string;
  address?: string;
}

export class UnitService {
  async create(data: CreateUnitDTO): Promise<Unit> {
    if (!data.name || data.name.trim() === '') {
      throw new Error('Nome é obrigatório');
    }
    if (!data.address || data.address.trim() === '') {
      throw new Error('Endereço é obrigatório');
    }

    return await prisma.unit.create({
      data: {
        name: data.name.trim(),
        address: data.address.trim(),
        active: true
      }
    });
  }

  async findAll(): Promise<Unit[]> {
    return await prisma.unit.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    });
  }

  async findAllIncludingInactive(): Promise<Unit[]> {
    return await prisma.unit.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async findById(id: number): Promise<Unit | null> {
    return await prisma.unit.findUnique({
      where: { id },
      include: {
        products: {
          where: { active: true }
        }
      }
    });
  }

  async update(id: number, data: UpdateUnitDTO): Promise<Unit> {
    const unit = await prisma.unit.findUnique({ where: { id } });
    if (!unit) {
      throw new Error('Unidade não encontrada');
    }

    if (data.name !== undefined && data.name.trim() === '') {
      throw new Error('Nome não pode estar vazio');
    }
    if (data.address !== undefined && data.address.trim() === '') {
      throw new Error('Endereço não pode estar vazio');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.address !== undefined) updateData.address = data.address.trim();

    return await prisma.unit.update({
      where: { id },
      data: updateData
    });
  }

  // soft delete
  async delete(id: number): Promise<Unit> {
    const unit = await prisma.unit.findUnique({ where: { id } });
    if (!unit) {
      throw new Error('Unidade não encontrada');
    }

    return await prisma.unit.update({
      where: { id },
      data: { active: false }
    });
  }

  // reativar
  async reactivate(id: number): Promise<Unit> {
    const unit = await prisma.unit.findUnique({ where: { id } });
    if (!unit) {
      throw new Error('Unidade não encontrada');
    }

    return await prisma.unit.update({
      where: { id },
      data: { active: true }
    });
  }
}