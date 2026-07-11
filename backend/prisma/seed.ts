import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Criar categorias
  const category1 = await prisma.category.upsert({
    where: { slug: 'teclados-mecanicos' },
    update: {},
    create: {
      name: 'Teclados Mecânicos',
      slug: 'teclados-mecanicos',
      description: 'Teclados mecânicos para gamers e profissionais',
    },
  });

  const category2 = await prisma.category.upsert({
    where: { slug: 'teclados-sem-fio' },
    update: {},
    create: {
      name: 'Teclados Sem Fio',
      slug: 'teclados-sem-fio',
      description: 'Teclados wireless para setup clean',
    },
  });

  const category3 = await prisma.category.upsert({
    where: { slug: 'mouses' },
    update: {},
    create: {
      name: 'Mouses',
      slug: 'mouses',
      description: 'Mouses gamers e productivity',
    },
  });

  const category4 = await prisma.category.upsert({
    where: { slug: 'acessorios' },
    update: {},
    create: {
      name: 'Acessórios',
      slug: 'acessorios',
      description: 'Keycaps, switches, switches e mais',
    },
  });

  // Criar produtos
  const products = [
    {
      name: 'TechKeys Pro Mecânico',
      slug: 'techkeys-pro-mecanico',
      description:
        'Teclado mecânico full-size com switches Blue, iluminação RGB e construção em alumínio.',
      price: 499.9,
      categoryId: category1.id,
      imageUrl: 'https://placehold.co/600x400/1a1a1a/ffffff?text=TechKeys+Pro',
      variations: [
        {
          name: 'Switch Blue',
          sku: 'TKP-BLUE',
          stockQuantity: 50,
          attributes: { switch: 'Blue', layout: 'ABNT2' },
        },
        {
          name: 'Switch Red',
          sku: 'TKP-RED',
          stockQuantity: 35,
          attributes: { switch: 'Red', layout: 'ABNT2' },
        },
        {
          name: 'Switch Brown',
          sku: 'TKP-BROWN',
          priceOverride: 479.9,
          stockQuantity: 40,
          attributes: { switch: 'Brown', layout: 'ABNT2' },
        },
      ],
    },
    {
      name: 'TechKeys Mini 60%',
      slug: 'techkeys-mini-60',
      description:
        'Teclado compacto 60% com switches Hot-swap e perfomance para gaming.',
      price: 349.9,
      categoryId: category1.id,
      imageUrl: 'https://placehold.co/600x400/2d2d2d/ffffff?text=Mini+60%25',
      variations: [
        {
          name: 'Preto',
          sku: 'TKM60-BLK',
          stockQuantity: 60,
          attributes: { cor: 'Preto' },
        },
        {
          name: 'Branco',
          sku: 'TKM60-WHT',
          stockQuantity: 45,
          attributes: { cor: 'Branco' },
        },
      ],
    },
    {
      name: 'TechKeys Wireless Pro',
      slug: 'techkeys-wireless-pro',
      description:
        'Teclado sem fio com conexão Bluetooth e 2.4GHz, bateria de longa duração.',
      price: 599.9,
      categoryId: category2.id,
      imageUrl: 'https://placehold.co/600x400/3d3d3d/ffffff?text=Wireless+Pro',
      variations: [
        {
          name: 'Preto',
          sku: 'TKWP-BLK',
          stockQuantity: 30,
          attributes: { cor: 'Preto' },
        },
      ],
    },
    {
      name: 'Mouse TechKeys Ergo',
      slug: 'mouse-techkeys-ergo',
      description:
        'Mouse ergonômico com sensor de alta precisão e 6 botões programáveis.',
      price: 249.9,
      categoryId: category3.id,
      imageUrl: 'https://placehold.co/600x400/4d4d4d/ffffff?text=Mouse+Ergo',
      variations: [
        {
          name: 'Preto',
          sku: 'MTE-BLK',
          stockQuantity: 100,
          attributes: { cor: 'Preto' },
        },
        {
          name: 'Branco',
          sku: 'MTE-WHT',
          stockQuantity: 75,
          attributes: { cor: 'Branco' },
        },
      ],
    },
    {
      name: 'Keycap Set PBT',
      slug: 'keycap-set-pbt',
      description:
        'Conjunto de keycaps em PBT com impressão dye-sub, compatível com layout ABNT2.',
      price: 189.9,
      categoryId: category4.id,
      imageUrl: 'https://placehold.co/600x400/5d5d5d/ffffff?text=Keycaps+PBT',
      variations: [
        {
          name: 'Olivia Dark',
          sku: 'KSP-OLIVIA',
          stockQuantity: 25,
          attributes: { tema: 'Olivia Dark' },
        },
        {
          name: 'Miami Nights',
          sku: 'KSP-MIAMI',
          stockQuantity: 20,
          attributes: { tema: 'Miami Nights' },
        },
      ],
    },
  ];

  for (const productData of products) {
    const { variations, ...product } = productData;

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...product,
        variations: {
          create: variations,
        },
      },
    });
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
