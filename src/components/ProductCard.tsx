'use client';

import { useState } from 'react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Minus, Plus } from 'lucide-react';
import Link from 'next/link';

export default function ProductCard({ product }: { product: Product }) {
    const { addToCart } = useCart();
    const [qty, setQty] = useState(product.type === 'meter' ? 0.5 : 1);
    const [selectedColor, setSelectedColor] = useState(product.colors[0]);

    const handleQtyChange = (val: number) => {
        let newQty = val;
        if (product.type === 'unit') {
            newQty = Math.max(1, Math.floor(newQty));
        } else {
            newQty = Math.max(0.5, Math.round(newQty * 2) / 2);
        }
        setQty(newQty);
    };

    const step = product.type === 'meter' ? 0.5 : 1;

    return (
        <div className="min-w-[280px] snap-start bg-white rounded-xl border border-stone-100 overflow-hidden group shadow-sm hover:shadow-md transition-all">
            <Link href={`/produto/${product.id}`}>
                <div className="relative h-[280px] bg-stone-100 overflow-hidden cursor-pointer">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.type === 'meter' && (
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 text-xs font-bold rounded text-stone-800">
                            Por Metro
                        </div>
                    )}
                </div>
            </Link>

            <div className="p-4">
                <Link href={`/produto/${product.id}`}>
                    <h3 className="font-medium text-lg text-stone-900 truncate hover:text-green-800 transition-colors cursor-pointer">
                        {product.name}
                    </h3>
                </Link>
                <p className="text-stone-500 mb-3">
                    R$ {product.price.toFixed(2)} <span className="text-xs">/ {product.type === 'meter' ? 'metro' : 'un'}</span>
                </p>

                <div className="space-y-3">
                    <div className="flex gap-2">
                        {product.colors.map(c => (
                            <button
                                key={c.name}
                                onClick={() => setSelectedColor(c)}
                                className={`w-6 h-6 rounded-full border ${selectedColor.name === c.name ? 'border-stone-900 ring-1 ring-stone-900' : 'border-stone-200'}`}
                                style={{ backgroundColor: c.hex }}
                                title={c.name}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                            <button onClick={() => handleQtyChange(qty - step)} className="p-2 hover:bg-stone-200 rounded-l-lg text-stone-600">
                                <Minus size={14} />
                            </button>
                            <span className="w-12 text-center text-sm font-medium">{qty}</span>
                            <button onClick={() => handleQtyChange(qty + step)} className="p-2 hover:bg-stone-200 rounded-r-lg text-stone-600">
                                <Plus size={14} />
                            </button>
                        </div>
                        <button
                            onClick={() => addToCart(product, qty, selectedColor)}
                            className="flex-1 bg-stone-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-800 flex items-center justify-center gap-2 transition-colors shadow-sm active:scale-95"
                        >
                            <ShoppingBag size={16} /> <span className="hidden sm:inline">Adicionar</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}