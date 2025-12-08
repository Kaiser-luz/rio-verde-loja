'use client'; // Adicionado para permitir interatividade (onClick, scroll)

import { useState, useEffect } from 'react';
import HeroCarousel from '@/components/HeroCarousel';
import ProductCard from '@/components/ProductCard';
import { getCategoriesAndProducts } from './actions'; // Importa a Server Action (vamos criar/ajustar isso)
import { Product, Category } from '@/lib/types'; // Importa os tipos
import { ArrowDown, Hash } from 'lucide-react';

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');

  useEffect(() => {
    // Carrega dados no cliente (ou poderia ser via props se fosse Server Component puro, 
    // mas precisamos de interatividade aqui para o menu "sticky" funcionar bem)
    const loadData = async () => {
        const data = await getCategoriesAndProducts();
        setCategories(data.categories);
        setProducts(data.products as Product[]);
        if (data.categories.length > 0) {
            setActiveCategory(data.categories[0].id);
        }
    };
    loadData();
  }, []);

  const scrollToCategory = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveCategory(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <HeroCarousel />

      {/* NAVEGAÇÃO DE CATEGORIAS (Sticky) */}
      <div className="sticky top-20 z-30 bg-white/95 backdrop-blur py-4 mb-8 border-b border-stone-100 overflow-x-auto scrollbar-hide">
        <div className="flex gap-3">
            {categories.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => scrollToCategory(cat.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all ${
                        activeCategory === cat.id 
                        ? 'bg-green-800 text-white shadow-md transform scale-105' 
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                >
                    {cat.name}
                </button>
            ))}
        </div>
      </div>

      {/* LISTA DE PRODUTOS POR CATEGORIA */}
      {categories.map(cat => {
        const catProducts = products.filter(p => p.category === cat.id);
        if (catProducts.length === 0) return null;

        return (
          <div key={cat.id} id={cat.id} className="mb-16 scroll-mt-40 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 p-2 rounded-lg text-green-800">
                <Hash size={24} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-stone-900">{cat.name}</h2>
              <span className="text-xs font-bold bg-stone-100 text-stone-500 px-2 py-1 rounded-full">
                {catProducts.length} itens
              </span>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-6 snap-x custom-scrollbar">
              {catProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        );
      })}
      
      {categories.length === 0 && (
          <div className="text-center py-20 text-stone-400">
              <p>Carregando catálogo...</p>
          </div>
      )}
    </div>
  );
}