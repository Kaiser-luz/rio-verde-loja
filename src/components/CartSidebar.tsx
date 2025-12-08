'use client';

import { useState } from 'react';
import { X, Loader2, CreditCard, ExternalLink, Truck, Store, Box, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { createOrder } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function CartSidebar() {
    const { isCartOpen, toggleCart, cart, removeFromCart, cartTotal } = useCart();
    const { user } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentLink, setPaymentLink] = useState<string | null>(null);
    const router = useRouter();

    // --- ESTADOS DE LOGÍSTICA ---
    const [deliveryMode, setDeliveryMode] = useState<'pickup' | 'shipping'>('pickup');
    const [cep, setCep] = useState('');
    const [shippingOptions, setShippingOptions] = useState<any[]>([]);
    const [selectedShipping, setSelectedShipping] = useState<any>(null);
    const [calculatingShipping, setCalculatingShipping] = useState(false);

    const getCustomerName = () => {
        if (!user) return "Visitante";
        const u = user as any;
        return u.user_metadata?.full_name || u.name || u.email || "Cliente";
    };

    const calculateShipping = async () => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length < 8) return;
        
        setCalculatingShipping(true);
        setShippingOptions([]);
        setSelectedShipping(null);

        try {
            const response = await fetch('/api/shipping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cep: cleanCep, items: cart })
            });

            const data = await response.json();
            
            if (Array.isArray(data)) {
                setShippingOptions(data);
                if (data.length > 0) setSelectedShipping(data[0]);
            } else {
                alert("Não foi possível calcular o frete para este CEP.");
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao conectar com servidor de fretes.");
        } finally {
            setCalculatingShipping(false);
        }
    };

    const shippingCost = (deliveryMode === 'shipping' && selectedShipping) ? Number(selectedShipping.price) : 0;
    const finalTotal = cartTotal + shippingCost;

    const handleCheckout = async () => {
        if (isProcessing) return;
        
        if (deliveryMode === 'shipping' && !selectedShipping) {
            alert("Por favor, calcule e selecione uma opção de frete.");
            return;
        }

        setIsProcessing(true);
        setPaymentLink(null);

        try {
            const userId = user ? user.id : undefined;
            const deliveryMethodName = deliveryMode === 'pickup' 
                ? 'Retirada na Loja' 
                : `${selectedShipping.company} - ${selectedShipping.name} (${selectedShipping.delivery_time} dias)`;

            const orderId = await createOrder(
                cart, 
                cartTotal,
                getCustomerName(), 
                userId,
                shippingCost,
                deliveryMethodName
            );

            if (!orderId) throw new Error("Erro ao salvar pedido.");

            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId }),
            });

            const text = await response.text();
            let data;
            try { data = JSON.parse(text); } catch (e) { throw new Error("Erro técnico no pagamento."); }

            if (data.url) {
                setPaymentLink(data.url);
                window.location.href = data.url;
            } else if (data.success && data.type === 'pix') {
                const params = new URLSearchParams({ pix_code: data.pix_code, pix_image: data.pix_image });
                toggleCart();
                router.push(`/sucesso?${params.toString()}`);
            } else {
                throw new Error(data.error || "Pagamento não autorizado.");
            }

        } catch (error: any) {
            console.error(error);
            alert(error.message);
            setIsProcessing(false);
        }
    };

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={toggleCart}></div>
            
            {/* AJUSTE AQUI: Mudamos max-w-md para sm:max-w-[400px] para ficar mais compacto */}
            <div className="relative bg-white w-full sm:max-w-[400px] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                
                {/* Header */}
                <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50 shrink-0">
                    <h2 className="text-xl font-serif font-medium flex items-center gap-2">
                        <ShoppingBag size={20} className="text-green-800"/> Seu Carrinho
                    </h2>
                    <button onClick={toggleCart} className="p-2 hover:bg-stone-200 rounded-full transition-colors"><X size={20} className="text-stone-500" /></button>
                </div>

                {/* Lista de Produtos (Com Scroll Customizado e classe custom-scrollbar) */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                    {cart.map((item, idx) => (
                        <div key={idx} className="flex gap-4 border-b border-stone-50 pb-4 last:border-0">
                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-stone-100 shrink-0">
                                <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="font-medium text-sm text-stone-900 truncate pr-2">{item.name}</p>
                                    <button onClick={() => removeFromCart(idx)} className="text-xs text-red-400 hover:text-red-600 font-medium">Remover</button>
                                </div>
                                <p className="text-xs text-stone-500 mb-1">Cor: <span className="font-bold text-stone-700">{item.selectedColor.name}</span></p>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs bg-stone-100 px-2 py-0.5 rounded text-stone-600">{item.quantity} {item.type === 'meter' ? 'm' : 'un'}</span>
                                    <span className="font-bold text-sm text-green-800">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-4">
                            <ShoppingBag size={48} className="opacity-20" />
                            <p>Seu carrinho está vazio.</p>
                        </div>
                    )}
                </div>

                {/* Footer (Fixo embaixo) */}
                <div className="p-5 border-t border-stone-100 bg-stone-50 space-y-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    
                    {/* OPÇÕES DE ENTREGA (Scroll interno se tiver muitas opções) */}
                    <div className="bg-white p-3 rounded-xl border border-stone-200">
                        <div className="flex gap-2 mb-3">
                            <label className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg border cursor-pointer transition-all text-center ${deliveryMode === 'pickup' ? 'border-green-600 bg-green-50 text-green-900' : 'border-stone-100 hover:bg-stone-50 text-stone-600'}`}>
                                <input type="radio" name="delivery" checked={deliveryMode === 'pickup'} onChange={() => setDeliveryMode('pickup')} className="hidden" />
                                <Store size={18} />
                                <span className="text-[10px] font-bold uppercase">Retirada</span>
                            </label>
                            <label className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg border cursor-pointer transition-all text-center ${deliveryMode === 'shipping' ? 'border-green-600 bg-green-50 text-green-900' : 'border-stone-100 hover:bg-stone-50 text-stone-600'}`}>
                                <input type="radio" name="delivery" checked={deliveryMode === 'shipping'} onChange={() => setDeliveryMode('shipping')} className="hidden" />
                                <Truck size={18} />
                                <span className="text-[10px] font-bold uppercase">Entrega</span>
                            </label>
                        </div>

                        {deliveryMode === 'shipping' && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <div className="flex gap-2 mb-2">
                                    <input 
                                        type="text" 
                                        placeholder="CEP" 
                                        value={cep} 
                                        onChange={(e) => setCep(e.target.value)} 
                                        className="flex-1 p-2 border border-stone-300 rounded-lg text-sm focus:border-green-500 outline-none" 
                                        maxLength={9} 
                                    />
                                    <button 
                                        onClick={calculateShipping} 
                                        disabled={calculatingShipping}
                                        className="bg-stone-800 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-stone-700 disabled:opacity-50"
                                    >
                                        {calculatingShipping ? <Loader2 size={14} className="animate-spin" /> : "OK"}
                                    </button>
                                </div>

                                {/* Lista de Fretes com Scroll Próprio se crescer muito */}
                                {shippingOptions.length > 0 && (
                                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                                        {shippingOptions.map((opt) => (
                                            <div key={opt.id} onClick={() => setSelectedShipping(opt)} className={`flex justify-between items-center p-2 rounded border text-xs cursor-pointer transition-colors ${selectedShipping?.id === opt.id ? 'border-green-500 bg-green-50' : 'border-stone-100 hover:bg-stone-50'}`}>
                                                <div><p className="font-bold text-stone-800 flex items-center gap-1">{opt.company === 'Correios' ? <Box size={12}/> : <Truck size={12}/>} {opt.name}</p><p className="text-[10px] text-stone-500">{opt.delivery_time} dias úteis</p></div>
                                                <p className="font-bold text-green-700">R$ {opt.price.toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {deliveryMode === 'pickup' && <p className="text-xs text-center text-stone-500 mt-1">Loja Bacacheri - Grátis</p>}
                    </div>

                    {/* TOTAIS */}
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-sm text-stone-500">
                            <span>Subtotal</span>
                            <span>R$ {cartTotal.toFixed(2)}</span>
                        </div>
                        {deliveryMode === 'shipping' && selectedShipping && (
                            <div className="flex justify-between items-center text-sm text-stone-500">
                                <span>Frete</span>
                                <span>+ R$ {Number(selectedShipping.price).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center border-t border-stone-200 pt-3 mt-2">
                            <span className="text-lg font-bold text-stone-800">Total</span>
                            <span className="text-2xl font-bold text-green-800">R$ {finalTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    {paymentLink ? (
                        <a href={paymentLink} className="block w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all text-center shadow-lg hover:shadow-blue-500/30 animate-pulse">
                            Pagar Agora <ExternalLink size={16} className="inline ml-1 mb-1"/>
                        </a>
                    ) : (
                        <button 
                            onClick={handleCheckout} 
                            disabled={cart.length === 0 || isProcessing} 
                            className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-green-800 disabled:bg-stone-300 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <CreditCard size={20} />}
                            {isProcessing ? "Processando..." : "Finalizar Compra"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}