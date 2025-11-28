const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Começando a popular o banco...');

    // 1. Limpa tudo
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();

    // 2. Cria as Categorias Iniciais
    console.log('📦 Criando categorias...');
    await prisma.category.createMany({
        data: [
            { id: 'linho', name: 'Linho Puro', type: 'meter' },
            { id: 'veludo', name: 'Veludo Premium', type: 'meter' },
            { id: 'boucle', name: 'Bouclé', type: 'meter' },
            { id: 'espumas', name: 'Espumas & Enchimentos', type: 'unit' },
            { id: 'colas', name: 'Colas & Adesivos', type: 'unit' },
            { id: 'armarinho', name: 'Armarinhos', type: 'unit' },
            { id: 'borrachas', name: 'Borrachas', type: 'meter' },
            { id: 'tapetes', name: 'Tapetes', type: 'unit' },
        ]
    });

    // 3. Cria Produtos de Exemplo
    console.log('🧶 Criando produtos...');
    await prisma.product.create({
        data: {
            name: 'Linho Rústico Natural',
            category: 'linho',
            price: 89.90,
            stock: 120.5,
            type: 'meter',
            image: 'https://picsum.photos/id/1036/800/600',
            colors: [{ name: 'Natural', hex: '#E3DAC9' }]
        }
    });

    console.log('✅ Banco pronto!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
```

**Rode o seed novamente:**
```bash
npx tsx prisma / seed.ts