import HeroCarousel from '@/components/HeroCarousel';
import ProductCard from '@/components/ProductCard';
import { prisma } from '@/lib/prisma';
import { Product, MeasurementType } from '@/lib/types';

// Busca Categorias e Produtos do Banco
async function getData() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  const productsRaw = await prisma.product.findMany();

  // Converte os dados do banco para o formato do site
  const products = productsRaw.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: Number(p.price),
    stock: Number(p.stock),
    type: p.type as MeasurementType,
    image: p.image,
    colors: p.colors as any,
  })) as Product[];

  return { categories, products };
}

export default async function Home() {
  const { categories, products } = await getData();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <HeroCarousel />

      {categories.map(cat => {
        const catProducts = products.filter(p => p.category === cat.id);
        // Só mostra a seção se tiver produtos nela
        if (catProducts.length === 0) return null;

        return (
          <div key={cat.id} id={cat.id} className="mb-12 animate-fade-in scroll-mt-28">
            <div className="flex justify-between items-end mb-6 border-b border-stone-100 pb-2">
              <h2 className="text-2xl font-serif text-stone-900">{cat.name}</h2>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-6 snap-x scrollbar-hide">
              {catProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}