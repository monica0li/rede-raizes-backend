import { prisma } from '../../config/prisma';

export class StockService {
  async addStock(productId: number, unitId: number, quantity: number) {
    //verifica se o produto existe
    const product = await prisma.product.findUnique({
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
      return await prisma.stock.update({
        where: { productId: productId },
        data: {
          quantity: {
            increment: quantity
          }
        }
      });
    } else {
      return await prisma.stock.create({
        data: {
          productId: productId,
          unitId: unitId,
          quantity: quantity
        }
      });
    }
  }

  async getStock(productId: number) {
    return await prisma.stock.findUnique({
      where: { productId: productId },
      include: { product: true, unit: true }
    });
  }

  async updateStock(productId: number, quantity: number, unitId?: number) {
    // verifica se o produto existe
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error(`Produto com ID ${productId} não encontrado`);
    }

    if (quantity < 0) {
      throw new Error('A quantidade não pode ser negativa');
    }

    // verifica se o estoque existe
    const existingStock = await prisma.stock.findUnique({
      where: { productId }
    });

    if (!existingStock) {
      //se não existe, cria um novo
      return await prisma.stock.create({
        data: {
          productId,
          unitId: unitId || product.unitId,
          quantity
        }
      });
    }

    //atualizar estoque
    return await prisma.stock.update({
      where: { productId },
      data: { quantity }
    });
  }
}