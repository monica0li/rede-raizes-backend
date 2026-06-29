import { prisma } from '../src/config/prisma';
import { hashPassword } from '../src/utils/hash';

async function main() {
  console.log('iniciando seed...');

  // 1. criar usuario admin
  const adminPassword = await hashPassword('Admin@123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@raizes.com' },
    update: {},
    create: {
      email: 'admin@raizes.com',
      password: adminPassword,
      name: 'Administrador Master',
      role: 'ADMIN'
    }
  });
  console.log(`usuario admin criado: ${admin.email} / Admin@123`);

  // 2. criar usuario cliente
  const clientPassword = await hashPassword('Cliente@123');
  const client = await prisma.user.upsert({
    where: { email: 'cliente@teste.com' },
    update: {},
    create: {
      email: 'cliente@teste.com',
      password: clientPassword,
      name: 'Cliente Teste',
      role: 'CLIENTE'
    }
  });
  console.log(`usuario cliente criado: ${client.email} / Cliente@123`);

  // 3. criar unidade 1 - centro
  const unit1 = await prisma.unit.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Raizes do Nordeste - Centro',
      address: 'Rua das Flores, 123, Centro, Sao Paulo - SP',
      active: true
    }
  });
  console.log(`unidade criada: ${unit1.name}`);

  // 4. criar unidade 2 - zona sul
  const unit2 = await prisma.unit.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Raizes do Nordeste - Zona Sul',
      address: 'Avenida Paulista, 456, Bela Vista, Sao Paulo - SP',
      active: true
    }
  });
  console.log(`unidade criada: ${unit2.name}`);

  // 5. criar produtos da unidade 1 (centro)
  const productsUnit1 = [
    { name: 'Coxinha', price: 8.50, description: 'Deliciosa coxinha de frango' },
    { name: 'Pastel', price: 7.00, description: 'Pastel de carne' },
    { name: 'Esfiha', price: 6.50, description: 'Esfiha de carne' },
    { name: 'Suco Natural', price: 12.00, description: 'Suco de laranja' },
    { name: 'Refrigerante', price: 5.00, description: 'Lata 350ml' }
  ];

  for (const productData of productsUnit1) {
    const product = await prisma.product.create({
      data: {
        name: productData.name,
        price: productData.price,
        description: productData.description,
        unitId: unit1.id,
        active: true,
        stock: {
          create: {
            quantity: 50,
            unitId: unit1.id
          }
        }
      }
    });
    console.log(`produto criado (unidade 1): ${product.name} - R$ ${product.price} (estoque: 50)`);
  }

  // 6. criar produtos da unidade 2 (zona sul)
  const productsUnit2 = [
    { name: 'Coxinha', price: 9.00, description: 'Coxinha de frango com catupiry' },
    { name: 'Pastel', price: 7.50, description: 'Pastel de carne com queijo' },
    { name: 'Esfiha', price: 7.00, description: 'Esfiha de carne com limao' },
    { name: 'Suco Natural', price: 13.00, description: 'Suco de laranja com acai' },
    { name: 'Refrigerante', price: 5.50, description: 'Lata 350ml' }
  ];

  for (const productData of productsUnit2) {
    const product = await prisma.product.create({
      data: {
        name: productData.name,
        price: productData.price,
        description: productData.description,
        unitId: unit2.id,
        active: true,
        stock: {
          create: {
            quantity: 40,
            unitId: unit2.id
          }
        }
      }
    });
    console.log(`produto criado (unidade 2): ${product.name} - R$ ${product.price} (estoque: 40)`);
  }

  console.log('seed finalizado!');
}

main()
  .catch((e) => {
    console.error('erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });