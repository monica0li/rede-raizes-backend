import { prisma } from '../src/config/prisma';

async function main() {
  console.log('🌱 Iniciando seed...');

  // Criar unidade
  const unit = await prisma.unit.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Raízes do Nordeste - Centro',
      address: 'Rua das Flores, 123, Centro, São Paulo - SP'
    }
  });

  console.log(`Unidade criada: ${unit.name}`);

  // Criar produtos
  const products = [
    { name: 'Coxinha', price: 8.50, description: 'Deliciosa coxinha de frango' },
    { name: 'Pastel', price: 7.00, description: 'Pastel de carne' },
    { name: 'Esfiha', price: 6.50, description: 'Esfiha de carne' },
    { name: 'Suco Natural', price: 12.00, description: 'Suco de laranja' },
    { name: 'Refrigerante', price: 5.00, description: 'Lata 350ml' }
  ];

  for (const productData of products) {
    const product = await prisma.product.create({
      data: {
        ...productData,
        unitId: unit.id,
        stock: {
          create: {
            quantity: 50,
            unitId: unit.id
          }
        }
      }
    });
    console.log(`Produto criado: ${product.name} - R$ ${product.price}`);
  }

  console.log('🎉 Seed finalizado!');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });