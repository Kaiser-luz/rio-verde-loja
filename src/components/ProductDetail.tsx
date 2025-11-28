'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/types';
import { ArrowLeft, Minus, Plus, ShoppingBag, Check, Truck } from 'lucide-react';

export default function ProductDetail({ product }: { product: Product }) {
    const router = useRouter();
    const { addToCart } = useCart();

    const [selectedColor, setSelectedColor] = useState(product.colors[0]);
    const [quantity, setQuantity] = useState(product.type === 'meter' ? 1.0 : 1);

    const handleQtyChange = (val: number) => {
        let newQty = val;
        if (product.type === 'unit') newQty = Math.max(1, Math.floor(newQty));
        else newQty = Math.max(0.1, newQty);
        if (newQty > product.stock) newQty = product.stock;
        setQuantity(parseFloat(newQty.toFixed(1)));
    };

    const subtotal = quantity * product.price;

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
            <button onClick={() => router.back()} className="flex items-center text-stone-500 hover:text-green-800 mb-8 font-medium transition-colors">
                <ArrowLeft size={20} className="mr-2" /> Voltar para loja
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
                <div className="bg-stone-100 rounded-2xl overflow-hidden h-[400px] md:h-[600px] relative shadow-inner">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex flex-col justify-center">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start mb-4">
                        {product.category}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-4 font-medium">{product.name}</h1>
                    <div className="flex items-baseline gap-4 mb-6 border-b border-stone-100 pb-6">
                        <span className="text-3xl font-bold text-stone-900">R$ {product.price.toFixed(2)}</span>
                        <div className="flex items-center text-green-700 text-sm font-medium bg-green-50 px-2 py-1 rounded">
                            <Check size={14} className="mr-1" /> Em Estoque: {product.stock}
                        </div>
                    </div>

                    <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 mb-8 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-sm font-bold text-stone-700">Quantidade</label>
                            <div className="text-right">
                                <span className="text-xs text-stone-500 block">Subtotal</span>
                                <span className="text-xl font-bold text-green-800">R$ {subtotal.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border border-stone-300 rounded-xl bg-white shadow-sm h-12">
                                <button onClick={() => handleQtyChange(quantity - (product.type === 'meter' ? 0.5 : 1))} className="px-4 h-full hover:bg-stone-100"><Minus size={18} /></button>
                                <input type="number" value={quantity} readOnly className="w-20 text-center font-bold bg-transparent" />
                                <button onClick={() => handleQtyChange(quantity + (product.type === 'meter' ? 0.5 : 1))} className="px-4 h-full hover:bg-stone-100"><Plus size={18} /></button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={() => addToCart(product, quantity, selectedColor)} className="flex-1 bg-stone-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-900 transition-all shadow-lg flex items-center justify-center gap-2">
                            <ShoppingBag size={20} /> Adicionar ao Carrinho
                        </button>
                    </div>

                    <div className="mt-8 flex items-center gap-3 text-sm text-stone-500 bg-white p-4 rounded-lg border border-stone-100">
                        <Truck size={20} className="text-green-600" />
                        <span>Entrega rápida para toda <strong>Curitiba e Região</strong>.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}