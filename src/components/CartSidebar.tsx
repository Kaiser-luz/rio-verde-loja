'use client';

import { useState } from 'react';
import { X, Loader2, CreditCard, ExternalLink, Truck, Store } from 'lucide-react';
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
    const [deliveryMethod, setDeliveryMethod] = useState<'retirada_loja' | 'entrega'>('retirada_loja');
    const [cep, setCep] = useState('');
    const [shippingCost, setShippingCost] = useState(0);
    const [calculatingShipping, setCalculatingShipping] = useState(false);

    const getCustomerName = () => {
        if (!user) return "Visitante";
        const u = user as any;
        return u.user_metadata?.full_name || u.name || u.email || "Cliente";
    };

    // Simulação de cálculo de frete (Integrar API Melhor Envio aqui no futuro)
    const calculateShipping = async () => {
        if (cep.length < 8) return;
        setCalculatingShipping(true);
        setTimeout(() => {
            setShippingCost(25.00); // Valor fixo simulado
            setCalculatingShipping(false);
        }, 1000);
    };

    // Total Final
    const finalTotal = deliveryMethod === 'retirada_loja' ? cartTotal : cartTotal + shippingCost;

    const handleCheckout = async () => {
        if (isProcessing) return;
        if (deliveryMethod === 'entrega' && shippingCost === 0) {
            alert("Por favor, calcule o frete antes de finalizar.");
            return;
        }

        setIsProcessing(true);
        setPaymentLink(null);

        try {
            const userId = user ? user.id : undefined;
            // Cria o pedido com os dados de entrega
            const orderId = await createOrder(
                cart, 
                cartTotal,
                getCustomerName(), 
                userId,
                shippingCost,
                deliveryMethod
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
            <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                    <h2 className="text-xl font-serif font-medium">Seu Carrinho</h2>
                    <button onClick={toggleCart}><X size={24} className="text-stone-400 hover:text-stone-900" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {cart.map((item, idx) => (
                        <div key={idx} className="flex gap-4 border-b border-stone-50 pb-4">
                            <img src={item.image} className="w-16 h-16 rounded object-cover bg-stone-100" />
                            <div className="flex-1">
                                <p className="font-medium text-sm">{item.name}</p>
                                <p className="text-xs text-stone-500">{item.quantity} {item.type === 'meter' ? 'm' : 'un'} • {item.selectedColor.name}</p>
                                <div className="flex justify-between mt-1"><span className="font-bold text-sm">R$ {(item.price * item.quantity).toFixed(2)}</span><button onClick={() => removeFromCart(idx)} className="text-xs text-red-500">Remover</button></div>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && <p className="text-center text-stone-400 mt-10">Carrinho vazio.</p>}
                </div>

                <div className="p-6 border-t border-stone-100 bg-stone-50 space-y-4">
                    {/* OPÇÕES DE ENTREGA */}
                    <div className="bg-white p-3 rounded-lg border border-stone-200">
                        <p className="text-sm font-bold text-stone-700 mb-2">Entrega</p>
                        <label className="flex items-center gap-3 p-2 rounded hover:bg-stone-50 cursor-pointer">
                            <input type="radio" name="delivery" checked={deliveryMethod === 'retirada_loja'} onChange={() => setDeliveryMethod('retirada_loja')} className="accent-green-800" />
                            <div className="flex-1"><div className="flex items-center gap-2 font-medium text-sm text-stone-800"><Store size={16} /> Retirada na Loja</div><p className="text-xs text-stone-500">Grátis</p></div>
                        </label>
                        <label className="flex items-center gap-3 p-2 rounded hover:bg-stone-50 cursor-pointer">
                            <input type="radio" name="delivery" checked={deliveryMethod === 'entrega'} onChange={() => setDeliveryMethod('entrega')} className="accent-green-800" />
                            <div className="flex-1"><div className="flex items-center gap-2 font-medium text-sm text-stone-800"><Truck size={16} /> Entrega</div><p className="text-xs text-stone-500">Correios / Motoboy</p></div>
                        </label>

                        {deliveryMethod === 'entrega' && (
                            <div className="mt-3 pl-7 animate-in fade-in">
                                <div className="flex gap-2">
                                    <input type="text" placeholder="CEP" value={cep} onChange={(e) => setCep(e.target.value)} className="w-full p-2 border rounded text-sm" maxLength={9} />
                                    <button onClick={calculateShipping} disabled={calculatingShipping} className="bg-stone-800 text-white px-3 py-2 rounded text-xs font-bold">{calculatingShipping ? <Loader2 size={14} className="animate-spin" /> : "OK"}</button>
                                </div>
                                {shippingCost > 0 && <p className="text-sm text-green-700 mt-2 font-medium">Frete: R$ {shippingCost.toFixed(2)}</p>}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center"><span className="text-stone-500">Subtotal</span><span className="text-stone-900">R$ {cartTotal.toFixed(2)}</span></div>
                    {deliveryMethod === 'entrega' && shippingCost > 0 && <div className="flex justify-between items-center text-sm"><span className="text-stone-500">Frete</span><span className="text-stone-900">+ R$ {shippingCost.toFixed(2)}</span></div>}
                    <div className="flex justify-between items-center border-t border-stone-200 pt-3"><span className="text-lg font-bold text-stone-800">Total</span><span className="text-xl font-bold text-green-800">R$ {finalTotal.toFixed(2)}</span></div>

                    {paymentLink ? (
                        <a href={paymentLink} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg animate-pulse"><ExternalLink size={20} /> Pagar Agora</a>
                    ) : (
                        <button onClick={handleCheckout} disabled={cart.length === 0 || isProcessing} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-stone-300 transition-colors flex items-center justify-center gap-2 shadow-lg active:scale-95">{isProcessing ? <><Loader2 size={20} className="animate-spin" /> Processando... </> : <><CreditCard size={20} /> Finalizar Compra </>}</button>
                    )}
                </div>
            </div>
        </div>
    );
}