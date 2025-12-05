'use client';

import { useState } from 'react';
import { X, ShoppingBag, Loader2, CreditCard, ExternalLink } from 'lucide-react';
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

    const getCustomerName = () => {
        if (!user) return "Visitante";
        const u = user as any;
        return u.user_metadata?.full_name || u.name || u.email || "Cliente";
    };

    const handleCheckout = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        setPaymentLink(null);

        try {
            console.log("🛒 Passo 1: Salvando pedido...");

            // CORREÇÃO CRÍTICA: Pegamos o ID do usuário se ele estiver logado
            const userId = user ? user.id : undefined;

            // Passamos o userId como 4º argumento para vincular o pedido à conta
            const orderId = await createOrder(cart, cartTotal, getCustomerName(), userId);

            if (!orderId) throw new Error("Não foi possível salvar o pedido no sistema.");

            console.log("💳 Passo 2: Gerando pagamento...");
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId }),
            });

            const text = await response.text();
            let data;

            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("Resposta não-JSON:", text);
                throw new Error("Erro técnico no servidor de pagamento.");
            }

            if (data.url) {
                console.log("🚀 Redirecionando para:", data.url);
                setPaymentLink(data.url);
                window.location.href = data.url;

            } else if (data.success && data.type === 'pix') {
                const params = new URLSearchParams({
                    pix_code: data.pix_code,
                    pix_image: data.pix_image
                });
                toggleCart();
                router.push(`/sucesso?${params.toString()}`);

            } else {
                throw new Error(data.error || "Pagamento não autorizado pelo sistema.");
            }

        } catch (error: any) {
            console.error("Erro no checkout:", error);
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
                                <div className="flex justify-between mt-1">
                                    <span className="font-bold text-sm">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                    <button onClick={() => removeFromCart(idx)} className="text-xs text-red-500">Remover</button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && <p className="text-center text-stone-400 mt-10">Carrinho vazio.</p>}
                </div>

                <div className="p-6 border-t border-stone-100 bg-stone-50">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-stone-500">Total</span>
                        <span className="text-xl font-bold text-stone-900">R$ {cartTotal.toFixed(2)}</span>
                    </div>

                    {paymentLink ? (
                        <a
                            href={paymentLink}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg animate-pulse"
                        >
                            <ExternalLink size={20} /> Clique aqui para Pagar
                        </a>
                    ) : (
                        <button
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || isProcessing}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-stone-300 transition-colors flex items-center justify-center gap-2 shadow-lg active:scale-95"
                        >
                            {isProcessing ? (
                                <> <Loader2 size={20} className="animate-spin" /> Gerando Pagamento... </>
                            ) : (
                                <> <CreditCard size={20} /> Ir para Pagamento </>
                            )}
                        </button>
                    )}

                    <p className="text-xs text-center text-stone-400 mt-2">Ambiente Seguro PagBank</p>
                </div>
            </div>
        </div>
    );
}