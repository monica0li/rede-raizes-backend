import { prisma } from '../../config/prisma';
import { Product } from '@prisma/client';

export interface CreateProductDTO {
  name: string;
  description?: string;
  price: number;
  unitId: number;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string | null;
  price?: number;
  unitId?: number;
}

export class ProductService {
  async create(data: CreateProductDTO): Promise<Product> {
    try {
      console.log('ProductService.create recebeu:', data);

      //validações
      if (!data.name || data.name.trim() === '') {
        throw new Error('Nome é obrigatório');
      }

      if (data.price <= 0) {
        throw new Error('Preço deve ser maior que zero');
      }

      if (!data.unitId) {
        throw new Error('Unidade é obrigatória');
      }

      //verificar se a unidade existe e está ativa
      const unit = await prisma.unit.findUnique({
        where: { id: data.unitId, active: true }
      });

      if (!unit) {
        throw new Error(`Unidade com ID ${data.unitId} não encontrada ou inativa`);
      }

      console.log('Unidade encontrada:', unit.id, unit.name);

      //criar o produto
      const product = await prisma.product.create({
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
    } catch (error: any) {
      console.error('Erro no ProductService.create:', error);
      throw error;
    }
  }

  async findAll(unitId?: number, includeInactive: boolean = false): Promise<Product[]> {
    try {
      const where: any = {};
      
      if (unitId) {
        where.unitId = unitId;
      }

      if (!includeInactive) {
        where.active = true;
      }

      return await prisma.product.findMany({
        where,
        include: {
          unit: true,
          stock: true
        },
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      throw error;
    }
  }

  async findById(id: number): Promise<Product | null> {
    try {
      return await prisma.product.findUnique({
        where: { id },
        include: {
          unit: true,
          stock: true
        }
      });
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }
  }

  async update(id: number, data: UpdateProductDTO): Promise<Product> {
    try {
      const product = await prisma.product.findUnique({ where: { id } });
      
      if (!product) {
        throw new Error('Produto não encontrado');
      }

      const updateData: any = {};

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
        const unit = await prisma.unit.findUnique({
          where: { id: data.unitId, active: true }
        });
        
        if (!unit) {
          throw new Error(`Unidade com ID ${data.unitId} não encontrada ou inativa`);
        }
        updateData.unitId = data.unitId;
      }

      return await prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          unit: true,
          stock: true
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  }

  //soft delete (inativar)
  async delete(id: number): Promise<Product> {
    try {
      const product = await prisma.product.findUnique({ where: { id } });
      
      if (!product) {
        throw new Error('Produto não encontrado');
      }

      return await prisma.product.update({
        where: { id },
        data: { active: false },
        include: {
          unit: true,
          stock: true
        }
      });
    } catch (error) {
      console.error('Erro ao inativar produto:', error);
      throw error;
    }
  }

  //reativar
  async reactivate(id: number): Promise<Product> {
    try {
      const product = await prisma.product.findUnique({ where: { id } });
      
      if (!product) {
        throw new Error('Produto não encontrado');
      }

      return await prisma.product.update({
        where: { id },
        data: { active: true },
        include: {
          unit: true,
          stock: true
        }
      });
    } catch (error) {
      console.error('Erro ao reativar produto:', error);
      throw error;
    }
  }
}