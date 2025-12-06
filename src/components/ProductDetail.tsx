'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Minus, Plus, ShoppingBag, Check, Truck, Tag, FileText } from 'lucide-react';

export default function ProductDetail({ product }: { product: any }) {
    const router = useRouter();
    const { addToCart } = useCart();
    const { profile } = useAuth(); 

    const [selectedColor, setSelectedColor] = useState(product.colors[0] || { name: 'Padrão', hex: '#FFF' });
    const [quantity, setQuantity] = useState(product.type === 'meter' ? 1.0 : 1);
    const [currentImage, setCurrentImage] = useState(product.image);

    const isUpholsterer = profile?.role === 'upholsterer' && (profile as any)?.approved;
    const finalPrice = (isUpholsterer && product.priceUpholsterer) ? Number(product.priceUpholsterer) : Number(product.price);

    useEffect(() => {
        if (selectedColor.image) setCurrentImage(selectedColor.image);
        else setCurrentImage(product.image);
    }, [selectedColor, product.image]);

    const handleQtyChange = (val: number) => {
        let newQty = val;
        if (product.type === 'unit') newQty = Math.max(1, Math.floor(newQty));
        else newQty = Math.max(0.1, newQty);
        if (newQty > Number(product.stock)) newQty = Number(product.stock);
        setQuantity(parseFloat(newQty.toFixed(1)));
    };

    const subtotal = quantity * finalPrice;

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
            <button onClick={() => router.back()} className="flex items-center text-stone-500 hover:text-green-800 mb-8 font-medium transition-colors">
                <ArrowLeft size={20} className="mr-2" /> Voltar para loja
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
                {/* FOTO */}
                <div className="bg-stone-100 rounded-2xl overflow-hidden h-[400px] md:h-[600px] relative shadow-inner group">
                    <img src={currentImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    {isUpholsterer && product.priceUpholsterer && (
                        <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                            <Tag size={12} /> Preço Atacado
                        </div>
                    )}
                </div>

                {/* DETALHES */}
                <div className="flex flex-col justify-center">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{product.category}</span>
                        
                        {/* --- BOTÃO DE PDF --- */}
                        {product.pdfUrl && (
                            <a 
                                href={product.pdfUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm font-bold text-blue-700 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                            >
                                <FileText size={18} /> Ver Catálogo PDF
                            </a>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-4 font-medium">{product.name}</h1>

                    <div className="flex flex-col mb-6 border-b border-stone-100 pb-6">
                        <div className="flex items-baseline gap-4">
                            <span className="text-3xl font-bold text-stone-900">
                                R$ {finalPrice.toFixed(2)}
                                <span className="text-lg text-stone-500 font-normal"> / {product.type === 'meter' ? 'mt' : 'un'}</span>
                            </span>
                            <div className="flex items-center text-green-700 text-sm font-medium bg-green-50 px-2 py-1 rounded"><Check size={14} className="mr-1" /> Em Estoque: {Number(product.stock)}</div>
                        </div>
                        {isUpholsterer && product.priceUpholsterer && <span className="text-sm text-stone-400 mt-1">Preço normal: <span className="line-through">R$ {Number(product.price).toFixed(2)}</span></span>}
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm font-bold text-stone-900 mb-3 uppercase tracking-wide">Selecione a Cor: <span className="font-normal text-stone-600 ml-1">{selectedColor.name}</span></label>
                        <div className="flex flex-wrap gap-3">
                            {product.colors.map((color: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-12 h-12 rounded-full border-2 transition-all shadow-sm ${selectedColor.name === color.name ? 'border-stone-900 scale-110 ring-2 ring-stone-200' : 'border-white hover:scale-105 hover:border-stone-300'}`}
                                    style={{ backgroundColor: color.hex }}
                                    title={color.name}
                                >
                                    {selectedColor.name === color.name && color.hex.toUpperCase() === '#FFFFFF' && <Check size={16} className="text-black mx-auto" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 mb-8 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-sm font-bold text-stone-700">{product.type === 'meter' ? 'Metragem (m)' : 'Quantidade (un)'}</label>
                            <div className="text-right"><span className="text-xs text-stone-500 block">Subtotal</span><span className="text-xl font-bold text-green-800">R$ {subtotal.toFixed(2)}</span></div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border border-stone-300 rounded-xl bg-white shadow-sm h-12">
                                <button onClick={() => handleQtyChange(quantity - (product.type === 'meter' ? 0.1 : 1))} className="px-4 h-full hover:bg-stone-100 text-stone-600 rounded-l-xl"><Minus size={18} /></button>
                                <input type="number" value={quantity} readOnly className="w-20 text-center border-none focus:ring-0 font-bold text-xl h-full bg-transparent text-stone-900" />
                                <button onClick={() => handleQtyChange(quantity + (product.type === 'meter' ? 0.1 : 1))} className="px-4 h-full hover:bg-stone-100 text-stone-600 rounded-r-xl"><Plus size={18} /></button>
                            </div>
                            <div className="text-xs text-stone-500 leading-tight max-w-[150px]">{product.type === 'meter' ? 'Corte mínimo de 0.10m.' : 'Venda unitária.'}</div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={() => addToCart({ ...product, price: finalPrice }, quantity, selectedColor)} className="flex-1 bg-stone-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-900 transition-all shadow-lg flex items-center justify-center gap-2">
                            <ShoppingBag size={20} /> Adicionar ao Carrinho
                        </button>
                    </div>

                    <div className="mt-8 flex items-center gap-3 text-sm text-stone-500 bg-white p-4 rounded-lg border border-stone-100">
                        <Truck size={20} className="text-green-600" />
                        <span>Entrega para toda Curitiba e Região.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}