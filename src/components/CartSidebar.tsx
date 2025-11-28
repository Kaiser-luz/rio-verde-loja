'use client';

import { useState } from 'react';
import { X, ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { createOrder } from '@/app/actions'; // Importa a ação que criamos

export default function CartSidebar() {
    const { isCartOpen, toggleCart, cart, removeFromCart, cartTotal } = useCart();
    const { user } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);

    // Número do WhatsApp da loja (apenas números, com código do país)
    const PHONE_NUMBER = "5541988494471";

    const handleCheckout = async () => {
        setIsProcessing(true);

        try {
            // 1. Salva o pedido no Banco de Dados (Supabase)
            const orderId = await createOrder(cart, cartTotal, user?.name || "");

            // 2. Monta a mensagem do WhatsApp
            let message = `*Olá! Gostaria de finalizar meu pedido na Rio Verde.*\n`;
            message += `-----------------------------------\n`;
            message += `*Pedido #:* ${orderId.slice(0, 8)}\n`; // Pega só os 8 primeiros dígitos do ID
            message += `*Cliente:* ${user?.name || "Visitante"}\n`;
            message += `-----------------------------------\n\n`;

            cart.forEach(item => {
                message += `• ${item.quantity}${item.type === 'meter' ? 'm' : 'un'} de *${item.name}*\n`;
                message += `  Cor: ${item.selectedColor.name} | R$ ${(item.price * item.quantity).toFixed(2)}\n\n`;
            });

            message += `-----------------------------------\n`;
            message += `*Total: R$ ${cartTotal.toFixed(2)}*\n`;
            message += `-----------------------------------\n`;
            message += `Aguardo confirmação de disponibilidade e frete.`;

            // 3. Redireciona para o WhatsApp
            const whatsappUrl = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');

            // 4. Limpa o carrinho (opcional, aqui vou apenas fechar)
            toggleCart();

        } catch (error) {
            alert("Houve um erro ao processar o pedido. Tente novamente.");
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={toggleCart}></div>

            <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                    <h2 className="text-xl font-serif font-medium">Seu Carrinho ({cart.length})</h2>
                    <button onClick={toggleCart}><X size={24} className="text-stone-400 hover:text-stone-900" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {cart.length === 0 ? (
                        <div className="text-center text-stone-400 mt-20">
                            <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Seu carrinho está vazio.</p>
                        </div>
                    ) : (
                        cart.map((item, idx) => (
                            <div key={`${item.id}-${idx}`} className="flex gap-4">
                                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover bg-stone-100" />
                                <div className="flex-1">
                                    <h3 className="font-medium text-stone-900">{item.name}</h3>
                                    <div className="text-sm text-stone-500 mb-1">
                                        Cor: {item.selectedColor.name} | {item.quantity} {item.type === 'meter' ? 'm' : 'un'}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                        <button
                                            onClick={() => removeFromCart(idx)}
                                            className="text-xs text-red-500 hover:underline"
                                        >
                                            Remover
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 border-t border-stone-100 bg-stone-50">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-stone-500">Subtotal</span>
                        <span className="text-xl font-bold text-stone-900">R$ {cartTotal.toFixed(2)}</span>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || isProcessing}
                        className="w-full bg-green-800 text-white py-3 rounded-lg font-medium hover:bg-green-900 disabled:bg-stone-300 transition-colors flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <> <Loader2 size={20} className="animate-spin" /> Processando... </>
                        ) : (
                            <> <MessageCircle size={20} /> Finalizar no WhatsApp </>
                        )}
                    </button>

                    <p className="text-xs text-center text-stone-400 mt-3">
                        Você será redirecionado para o WhatsApp da loja para confirmar o pagamento e entrega.
                    </p>
                </div>
            </div>
        </div>
    );
}

// Pequeno helper para o ícone do WhatsApp
import { MessageCircle } from 'lucide-react';