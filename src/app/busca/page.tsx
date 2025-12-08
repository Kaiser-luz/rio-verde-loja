import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import { Search } from 'lucide-react';
import { Product, MeasurementType } from '@/lib/types';

// Função auxiliar para buscar produtos no banco
async function getProducts(query: string) {
    if (!query) return [];

    // Busca produtos onde o nome OU a categoria contenha o termo pesquisado (insensível a maiúsculas/minúsculas)
    const productsRaw = await prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { category: { contains: query, mode: 'insensitive' } },
            ],
        },
    });

    // Mapeia para o tipo Product esperado pelo componente
    return productsRaw.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: Number(p.price),
        priceUpholsterer: p.priceUpholsterer ? Number(p.priceUpholsterer) : null,
        stock: Number(p.stock),
        type: p.type as MeasurementType,
        image: p.image,
        colors: p.colors as any,
        pdfUrl: p.pdfUrl,
    })) as Product[];
}

// Componente da Página de Busca (Server Component)
export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    // Aguarda os parâmetros de busca
    const { q } = await searchParams;
    const query = q || '';

    // Busca os produtos
    const filteredProducts = await getProducts(query);

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 min-h-[60vh]">
            <div className="mb-8">
                <h1 className="text-3xl font-serif text-stone-900 mb-2">
                    Resultados para: <span className="text-green-800 font-bold">"{query}"</span>
                </h1>
                <p className="text-stone-500">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                </p>
            </div>

            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-stone-50 rounded-2xl border border-stone-100 text-center">
                    <div className="bg-stone-200 p-4 rounded-full mb-4">
                        <Search size={32} className="text-stone-500" />
                    </div>
                    <h2 className="text-xl font-bold text-stone-900 mb-2">Nenhum produto encontrado</h2>
                    <p className="text-stone-500 max-w-md">
                        Não encontramos nada com "<strong>{query}</strong>". Tente buscar por termos mais genéricos como "Linho", "Veludo" ou "Espuma".
                    </p>
                </div>
            )}
        </div>
    );
}