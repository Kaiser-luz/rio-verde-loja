'use client';

import { useSearchParams } from 'next/navigation';
import { INITIAL_PRODUCTS } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import { Search } from 'lucide-react';
import { Suspense } from 'react';

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q')?.toLowerCase() || '';

    // Filtra os produtos pelo nome ou categoria
    const filteredProducts = INITIAL_PRODUCTS.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-serif text-stone-900 mb-2">
                    Resultados para: <span className="text-green-800 font-bold">"{query}"</span>
                </h1>
                <p className="text-stone-500">{filteredProducts.length} produtos encontrados</p>
            </div>

            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-stone-50 rounded-2xl border border-stone-100">
                    <Search size={48} className="text-stone-300 mb-4" />
                    <h2 className="text-xl font-medium text-stone-900 mb-2">Nenhum produto encontrado</h2>
                    <p className="text-stone-500">Tente buscar por "Linho", "Veludo" ou "Cola".</p>
                </div>
            )}
        </div>
    );
}

// Wrapper necessário para usar useSearchParams no Next.js
export default function SearchPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center">Carregando busca...</div>}>
            <SearchResults />
        </Suspense>
    );
}